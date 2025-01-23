import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.api.deps import (
    OrganizationServiceDep,
    UserContextDep,
    UserContextWithPermissions,
    UserServiceDep,
)
from app.models import (
    Action,
    CreateBranchInviteRequest,
    CreateBranchRequest,
    Invite,
    ModifyMemberAccessRequest,
    Resource,
    Role,
    User,
    UserResponse,
)
from app.utils import raise_custom_exception

router = APIRouter()

logger = logging.getLogger("uvicorn")


@router.post("/branches")
def create_branch(
    req: CreateBranchRequest,
    user_ctx: UserContextDep,
    organization_service: OrganizationServiceDep,
    user_service: UserServiceDep,
):
    """
    Create a new branch for an organization.

    Args:
        req (CreateBranchRequest): The request object containing branch details.
        user_ctx (UserContext): The user context object.
        organization_service (OrganizationService): The organization service.

    Returns:
        Branch: The response object containing the created branch details.
    """
    branch = organization_service.create_branch(
        req, user_ctx.organization_id
    ).model_dump()
    logger.info(f"Branch created: {branch['id']}|{branch['name']}")
    # Add the user to the branch
    organization_service.add_user_to_branch(branch["id"], user_ctx.id)
    # Set the current branch for the user
    user_service.set_current_branch(user_ctx.id, branch["id"])
    logger.info(f"User added to branch: {branch['id']}")
    return branch


@router.get("/branches/{branch_id}/members")
def get_branch_members(
    branch_id: str,
    user_ctx: UserContextDep,
    organization_service: OrganizationServiceDep,
) -> list[UserResponse]:
    """
    Get the members of a branch.

    Args:
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context dependency.
        organization_service (OrganizationServiceDep): The organization service dependency.

    Returns:
        list[User]: A list of users who are members of the branch.
    """
    return organization_service.get_members(user_ctx.organization_id, branch_id)


@router.get("/branches/{branch_id}/invites")
def get_branch_invites(
    branch_id: str,
    user_ctx: Annotated[
        User | JSONResponse,
        Depends(UserContextWithPermissions((Resource.INVITE, [Action.READ]))),
    ],
    organization_service: OrganizationServiceDep,
) -> list[Invite]:
    """
    Get the invites for a branch.

    Args:
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context dependency.
        organization_service (OrganizationServiceDep): The organization service dependency.

    Returns:
        list[Invite]: A list of invites for the branch.
    """
    if type(user_ctx) is not User:
        return user_ctx

    return organization_service.get_invites(user_ctx.organization_id, branch_id)


@router.post("/branches/{branch_id}/invites")
def create_branch_invite(
    req: CreateBranchInviteRequest,
    branch_id: str,
    user_ctx: Annotated[
        User | JSONResponse,
        Depends(UserContextWithPermissions((Resource.INVITE, [Action.WRITE]))),
    ],
    organization_service: OrganizationServiceDep,
) -> Invite:
    """
    Create an invite for a branch.

    Args:
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context dependency.
        organization_service (OrganizationServiceDep): The organization service dependency.

    Returns:
        Invite: The created invite.
    """
    if type(user_ctx) is not User:
        return user_ctx

    if (
        organization_service.get_member(user_ctx.organization_id, branch_id, req.email)
        is not None
    ):
        return raise_custom_exception(400, "User is already a member of the branch")

    org = organization_service.get_organization_by_id(user_ctx.organization_id)

    return organization_service.create_invite(
        req.email,
        user_ctx.organization_id,
        branch_id,
        user_ctx.id,
        Role.MANAGER,
        req.name,
        org.name,
    )


@router.post("/branches/{branch_id}/members/{member_id}/access")
def modify_member_access(
    branch_id: str,
    member_id: str,
    req: ModifyMemberAccessRequest,
    user_ctx: UserContextDep,
    user_service: UserServiceDep,
):
    """
    Modify the access of a member in a branch.

    Args:
        branch_id (str): The ID of the branch.
        member_id (str): The ID of the member.
        req (ModifyMemberAccessRequest): The request object containing the access details.
        user_ctx (UserContextDep): The user context dependency.
        user_service (UserServiceDep): The user service dependency.

    Returns:
        int: The HTTP status code.
        dict: The response object containing the updated member details.
    """
    if (
        user_ctx.role != Role.ADMIN
        or user_ctx.current_branch_id != branch_id
        or user_ctx.id == member_id
    ):
        return raise_custom_exception(
            403, "User does not have permission to modify member access"
        )

    member = user_service.get_user_by_id(member_id)
    if member is None:
        return raise_custom_exception(404, "Member not found")

    member.is_active = req.is_active
    user_service.update_user(member)

    return 200
