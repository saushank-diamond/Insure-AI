import logging
from datetime import timedelta

from fastapi import APIRouter

from app.api.deps import (
    OrganizationServiceDep,
    UserContextDep,
    UserServiceDep,
)
from app.core import security
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models import (
    CreateOrganizationRequest,
    InviteStatus,
    Role,
    Token,
    User,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.utils import (
    raise_custom_exception,
)

router = APIRouter()

logger = logging.getLogger("uvicorn")


@router.post("/register")
def register(
    req: UserRegisterRequest,
    user_service: UserServiceDep,
    organization_service: OrganizationServiceDep,
) -> Token:
    """
    Register a new user account.

    Args:
    - req: UserRegisterRequest object containing the user's registration details.
    - user_service: Instance of UserService for user-related operations.
    - organization_service: Instance of OrganizationService for organization-related operations.

    Returns:
    - Token: Access token for the registered user.
    """
    if req.invite_token:
        invite = organization_service.get_invite(req.invite_token)
        if invite is None:
            return raise_custom_exception(400, "Invite not found")
        if invite.status != InviteStatus.PENDING:
            return raise_custom_exception(400, "Invite already accepted")

        if organization_service.get_member(
            invite.organization_id, invite.branch_id, invite.email
        ):
            return raise_custom_exception(400, "User is already a member of the branch")

        user = user_service.create_user(
            user=UserRegisterRequest(
                full_name=invite.name,
                email=invite.email,
                password=req.password,
                organization_name=invite.organization_name,
                invite_token=req.invite_token,
            ),
            org_id=invite.organization_id,
            role=Role.MANAGER,
        )

        organization_service.add_user_to_branch(invite.branch_id, user.id)
        user_service.set_current_branch(user.id, invite.branch_id)
        organization_service.accept_invite(invite)
        org_id = invite.organization_id
        logger.info(f"Invited user {user.email} added to branch: {invite.branch_id}")
    else:
        org = organization_service.create_organization(
            org=CreateOrganizationRequest(name=req.organization_name)
        )
        org_id = org.id
        logger.info(f"Organization created: {org.id}|{org.name}")
        user = user_service.create_user(user=req, org_id=org.id, role=Role.ADMIN)
        logger.info(f"User created: {user.id}|{user.full_name}")

    return Token(
        access_token=create_access_token(
            user.id,
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            metadata={
                "organization_id": org_id,
                "branch_id": user.current_branch_id,
                "role": user.role,
            },
        ),
    )


@router.post("/login")
def login(
    req: UserLoginRequest,
    user_service: UserServiceDep,
    organization_service: OrganizationServiceDep,
) -> Token:
    """
    Authenticates a user and generates an access token.

    Args:
        req (UserLoginRequest): The user login request object containing email and password.
        user_service (UserService): The user service instance.
        organization_service (OrganizationService): The organization service instance.

    Returns:
        Token: The access token object containing the generated access token and token type.
    """
    user = user_service.get_user_by_email(req.email)
    if not user:
        logger.error("User not found")
        return raise_custom_exception(400, "Incorrect email or password")
    if not verify_password(req.password.get_secret_value(), user.hashed_password):
        logger.error("Incorrect password")
        return raise_custom_exception(400, "Incorrect email or password")
    if not user.is_active:
        logger.error("User is not active")
        return raise_custom_exception(403, "User account is deactivated")

    return Token(
        access_token=security.create_access_token(
            user.id,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            metadata={
                "organization_id": user.organization_id,
                "branch_id": user.current_branch_id,
                "role": user.role,
            },
        ),
    )


@router.get("/me")
def get_me(
    user_ctx: UserContextDep,
    user_service: UserServiceDep,
) -> User:
    """
    Retrieves the current user's information.

    Args:
        user_ctx (UserContextDep): The user context dependency.
        user_service (UserServiceDep): The user service dependency.

    Returns:
        User: The current user's information.
    """
    current_user = user_service.get_user_by_id(user_ctx.id)
    if current_user is None:
        return raise_custom_exception(404, "User not found")
    del current_user.hashed_password
    return current_user
