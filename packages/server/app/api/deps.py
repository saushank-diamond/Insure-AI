from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from fastapi.responses import JSONResponse
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jose import JWTError, jwt
from pydantic import ValidationError
from retell import Retell
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import ROLE_PERMISSIONS, Action, Resource, TokenPayload, User
from app.services.agent_service import AgentService
from app.services.call_service import CallService
from app.services.event_service import EventService
from app.services.lead_service import LeadService
from app.services.metrics_service import MetricsService
from app.services.organization_service import OrganizationService
from app.services.prompt_service import PromptService
from app.services.user_service import UserService
from app.utils import raise_custom_exception

bearer_scheme = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_organization_service(db: Session = Depends(get_db)) -> OrganizationService:
    return OrganizationService(db)


def get_lead_service(db: Session = Depends(get_db)) -> LeadService:
    return LeadService(db)


def get_prompt_service(db: Session = Depends(get_db)) -> PromptService:
    return PromptService(db)


def get_metrics_service(db: Session = Depends(get_db)) -> MetricsService:
    return MetricsService(db)


def get_retellai_service() -> Retell:
    return Retell(api_key=settings.RETELL_API_KEY)


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    return AgentService(db)


def get_call_service(db: Session = Depends(get_db)) -> CallService:
    return CallService(db)


def get_event_service(db: Session = Depends(get_db)) -> EventService:
    return EventService(db)


def get_user_context(
    token: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> User:
    try:
        payload = jwt.decode(
            token.credentials, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        user = user_service.get_user_by_id(token_data.sub)
        if not user:
            return raise_custom_exception(404, "User not found")
        if not user.is_active:
            return raise_custom_exception(403, "User account is deactivated")
        return user
    except (JWTError, ValidationError):
        return raise_custom_exception(403, "Failed to validate credentials")


def is_authorized(
    resource: Resource, actions: list[Action], user: User
) -> User | JSONResponse:
    """
    Checks if the user has the specified role and resource with the given actions.

    Args:
        role (Role): The role to check.
        resource (Resource): The resource to check.
        actions (list[Action]): The actions to check.

    Returns: The user object.
    """
    if user.role not in ROLE_PERMISSIONS:
        return raise_custom_exception(403, "User not authorized")
    if resource not in ROLE_PERMISSIONS[user.role]:
        return raise_custom_exception(403, "User not authorized")
    for action in actions:
        if action not in ROLE_PERMISSIONS[user.role][resource]:
            return raise_custom_exception(403, "User not authorized")
    return user


def UserContextWithPermissions(
    required_permissions: tuple[Resource, list[Action]],
):
    def _user_context_with_permissions(
        token: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
        user_service: Annotated[UserService, Depends(get_user_service)],
    ) -> User | JSONResponse:
        try:
            payload = jwt.decode(
                token.credentials, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
            user = user_service.get_user_by_id(token_data.sub)
            if not user:
                return raise_custom_exception(404, "User not found")
            return is_authorized(required_permissions[0], required_permissions[1], user)
        except (JWTError, ValidationError):
            return raise_custom_exception(403, "Failed to validate credentials")

    return _user_context_with_permissions


UserContextDep = Annotated[User, Depends(get_user_context)]
SessionDep = Annotated[Session, Depends(get_db)]
OrganizationServiceDep = Annotated[
    OrganizationService, Depends(get_organization_service)
]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
LeadServiceDep = Annotated[LeadService, Depends(get_lead_service)]
PromptServiceDep = Annotated[PromptService, Depends(get_prompt_service)]
MetricsServiceDep = Annotated[MetricsService, Depends(get_metrics_service)]
RetellAIServiceDep = Annotated[Retell, Depends(get_retellai_service)]
AgentServiceDep = Annotated[AgentService, Depends(get_agent_service)]
CallServiceDep = Annotated[CallService, Depends(get_call_service)]
EventServiceDep = Annotated[EventService, Depends(get_event_service)]
