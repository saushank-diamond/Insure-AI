import logging
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.api.deps import (
    PromptServiceDep,
    UserContextDep,
    UserContextWithPermissions,
)
from app.models import (
    Action,
    CreatePromptRequest,
    DeleteResponse,
    Prompt,
    Resource,
    UpdatePromptRequest,
    User,
)
from app.utils import raise_custom_exception

router = APIRouter()

logger = logging.getLogger("uvicorn")


@router.post("/prompts")
def create_prompt(
    req: CreatePromptRequest,
    user_ctx: Annotated[
        User | JSONResponse,
        Depends(UserContextWithPermissions((Resource.PROMPT, [Action.WRITE]))),
    ],
    prompt_service: PromptServiceDep,
) -> Prompt:
    """
    Create a new prompt.

    Args:
        req (CreatePromptRequest): The request object containing the prompt details.
        user_ctx (UserContextDep): The user context object.
        prompt_service (PromptServiceDep): The prompt service dependency.

    Returns:
        The created prompt.
    """
    if type(user_ctx) is not User:
        return user_ctx

    conversation_prompt = prompt_service.create_prompt(
        name=req.name,
        prompt=req.text,
        org_id=user_ctx.organization_id,
        branch_id=req.branch_id,
        user_id=user_ctx.id,
        created_by_name=user_ctx.full_name,
        known_to_agent=req.known_to_agent,
        meeting_status=req.meeting_status,
        prompt_type=req.prompt_type,
        report_prompt_text=req.report_prompt_text,
        description=req.description,
    )

    logger.info(f"Prompt created successfully: {conversation_prompt.id}")
    return conversation_prompt


@router.get("/prompts")
def get_prompts(
    branch_id: str,
    user_ctx: UserContextDep,
    prompt_service: PromptServiceDep,
) -> list[Prompt]:
    """
    Retrieves prompts for a given branch.

    Args:
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context.
        prompt_service (PromptServiceDep): The prompt service.

    Returns:
        List[Prompt]: A list of prompts for the given branch.
    """
    prompts = prompt_service.get_prompts(branch_id=branch_id)
    logger.info(f"Prompts retrieved successfully: {len(prompts)} prompts")
    return prompts


@router.post("/prompts/{prompt_id}")
def update_prompt(
    prompt_id: str,
    req: UpdatePromptRequest,
    user_ctx: UserContextDep,
    prompt_service: PromptServiceDep,
) -> Prompt:
    """
    Update a prompt with the given prompt_id.

    Args:
        prompt_id (str): The ID of the prompt to update.
        req (UpdatePromptRequest): The request object containing the updated prompt data.
        user_ctx (UserContextDep): The user context dependency.
        prompt_service (PromptServiceDep): The prompt service dependency.

    Returns:
        Prompt: The updated prompt object.

    Raises:
        HTTPException: If the prompt with the given prompt_id is not found.
    """
    prompt = prompt_service.get_prompt(prompt_id)
    if prompt is None:
        return raise_custom_exception(404, "Prompt not found")

    prompt_req = req.model_dump(exclude_unset=True)

    # Make sure we don't allow updates to specific fields
    restricted_fields = [
        "id",
        "object",
        "created_at",
        "updated_at",
        "deleted_at",
        "branch_id",
        "organization_id",
        "created_by",
    ]
    for field in restricted_fields:
        if field in prompt_req:
            del prompt_req[field]

    prompt.sqlmodel_update(
        prompt_req, update={"updated_at": datetime.now(tz=timezone.utc)}
    )

    logger.info("Prompt updated successfully: {prompt_id}")
    return prompt_service.update_prompt(prompt)


@router.get("/prompts/{prompt_id}")
def get_prompt(
    prompt_id: str,
    user_ctx: UserContextDep,
    prompt_service: PromptServiceDep,
) -> Prompt:
    """
    Retrieve a prompt by its ID.

    Args:
        prompt_id (str): The ID of the prompt to retrieve.
        user_ctx (UserContextDep): The user context dependency.
        prompt_service (PromptServiceDep): The prompt service dependency.

    Returns:
        The prompt object if found, otherwise raises a custom exception with status code 404.
    """
    prompt = prompt_service.get_prompt(prompt_id)
    if prompt is None:
        return raise_custom_exception(404, "Prompt not found")
    logger.info(f"Prompt retrieved successfully: {prompt.id}")
    return prompt


@router.delete("/prompts/{prompt_id}")
def delete_prompt(
    prompt_id: str,
    user_ctx: UserContextDep,
    prompt_service: PromptServiceDep,
):
    """
    Delete a prompt by its ID.

    Args:
        prompt_id (str): The ID of the prompt to delete.
        user_ctx (UserContextDep): The user context dependency.
        prompt_service (PromptServiceDep): The prompt service dependency.

    Returns:
        DeleteResponse: The response indicating whether the prompt was successfully deleted.
    """
    result = prompt_service.delete_prompt(prompt_id)
    logger.info(f"Prompt deleted successfully: {prompt_id}, result: {result}")
    return DeleteResponse(id=prompt_id, deleted=result)
