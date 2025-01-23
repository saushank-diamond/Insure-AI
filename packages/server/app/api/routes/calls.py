import json
import logging
from datetime import datetime, timezone

import instructor
from fastapi import APIRouter, Response
from fastapi.responses import JSONResponse
from openai import AsyncOpenAI
from retell.types import RegisterCallResponse

from app.api.deps import (
    AgentServiceDep,
    CallServiceDep,
    EventServiceDep,
    LeadServiceDep,
    PromptServiceDep,
    RetellAIServiceDep,
    UserContextDep,
)
from app.core.config import settings
from app.models import (
    Call,
    CallReport,
    CallResponse,
    CreateCallRequest,
    EventType,
    Role,
)
from app.utils import raise_custom_exception

router = APIRouter()

logger = logging.getLogger("uvicorn")

client = instructor.from_openai(AsyncOpenAI(api_key=settings.OPENAI_API_KEY))


def get_report_system_prompt():
    return """
    You are a world class sales call report analyzer. Your task is to generate a report for a call between an insurance agent and a lead.
    """


def generate_text_file(call: Call):
    content = ""

    content += f"Call ID: {call.id}\n"
    content += f"Call Type: {call.type.value}\n"
    content += f"Agent ID: {call.agent_id}\n"
    content += f"Lead ID: {call.lead_id}\n"
    content += f"Duration: {json.loads(call.call_metadata)['duration']}\n"

    if call.transcript:
        content += f"\nTranscript:\n{call.transcript}\n"

    return content


async def report_generator(transcript: str, custom_prompt: str = None) -> CallReport:
    PLANNING_MODEL = "gpt-4-turbo"

    messages = [
        {
            "role": "system",
            "content": custom_prompt if custom_prompt else get_report_system_prompt(),
        },
        {
            "role": "user",
            "content": f"Transcript: {transcript}\nGenerate the call report based on the transcript. Make sure you always inlude multiple feedback.",
        },
    ]

    root = await client.chat.completions.create(
        model=PLANNING_MODEL,
        temperature=0.1,
        response_model=CallReport,
        messages=messages,
    )

    return root


@router.post("/calls")
async def create_call(
    req: CreateCallRequest,
    user_ctx: UserContextDep,
    agent_service: AgentServiceDep,
    lead_service: LeadServiceDep,
    retell_service: RetellAIServiceDep,
    call_service: CallServiceDep,
    prompt_service: PromptServiceDep,
    event_service: EventServiceDep,
) -> RegisterCallResponse:
    """
    Create a call for a lead.

    Args:
        req (CreateCallRequest): The request object containing the call details.
        user_ctx (UserContextDep): The user context dependency.
        agent_service (AgentServiceDep): The agent service dependency.
        lead_service (LeadServiceDep): The lead service dependency.
        retell_service (RetellAIServiceDep): The retell AI service dependency.
        call_service (CallServiceDep): The call service dependency.
        prompt_service (PromptServiceDep): The prompt service dependency.
        event_service (EventServiceDep): The event service dependency.

    Returns:
        RegisterCallResponse: The response object containing the call details.
    """
    logger.info("Received request to create a call")

    lead_tuple = lead_service.get_lead(req.lead_id)
    if lead_tuple is None:
        return raise_custom_exception(404, "Lead not found")

    agent = agent_service.get_agent(req.lead_id)
    if agent is None:
        return raise_custom_exception(404, "Agent not found")

    # Inject lead persona into the prompt
    persona = lead_tuple[0].model_dump_json()

    # Create a snapshot of the lead's profile before initiating the call
    profile_snapshot = lead_service.create_profile_snapshot(
        lead_id=lead_tuple[1].id, profile=lead_tuple[0], lead=lead_tuple[1]
    )

    logger.info("Snapshot of lead's profile created")

    # Create a call reference
    call_ref = call_service.create_call(
        user_id=user_ctx.id,
        lead_id=req.lead_id,
        profile_snapshot_id=profile_snapshot.id,
        branch_id=lead_tuple[1].branch_id,
        org_id=user_ctx.organization_id,
        agent_id=agent.id,
        caller_name=user_ctx.full_name,
        prompt_id=req.prompt_id,
    )

    metadata = {
        "user_id": user_ctx.id,
        "lead_id": req.lead_id,
        "prompt_id": req.prompt_id,
        "profile_snapshot_id": profile_snapshot.id,
        "retell_agent_id": agent.retell_agent_id,
        "call_id": call_ref.id,
        "lead_type": lead_tuple[1].type,
        "lead_status": lead_tuple[1].status,
        "call_type": req.call_type,
        "branch_id": lead_tuple[1].branch_id,
        "org_id": user_ctx.organization_id,
    }

    dynamic_variables = {
        "persona": persona,
    }

    # Inject user-defined prompt
    if req.prompt_id:
        prompt = prompt_service.get_prompt(req.prompt_id)
        if prompt:
            dynamic_variables["custom_prompt"] = prompt.text
            metadata["report_prompt"] = prompt.report_prompt_text

    # Make sure we register the call with Retell
    retell_call = retell_service.call.register(
        agent_id=agent.retell_agent_id,
        audio_encoding="s16le",
        audio_websocket_protocol="web",
        sample_rate=24000,
        end_call_after_silence_ms=30000,
        metadata=metadata,
        retell_llm_dynamic_variables=dynamic_variables,
    )

    logger.info("Call registered with Retell")

    # EVENT: Call started
    event_service.create_event(
        name=EventType.CALL_STARTED,
        data={
            "call_id": call_ref.id,
            "user_id": user_ctx.id,
            "lead_id": req.lead_id,
            "lead_type": lead_tuple[1].type,
            "lead_status": lead_tuple[1].status,
            "start_timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "profile_snapshot_id": profile_snapshot.id,
            "agent_id": agent.id,
            "retell_agent_id": retell_call.agent_id,
            "call_type": req.call_type,
        },
        org_id=user_ctx.organization_id,
        branch_id=lead_tuple[1].branch_id,
    )

    logger.info(f"Call start event recorded: {call_ref.id}")
    return retell_call


@router.get("/calls/{call_id}/report")
def get_call_report(
    call_id: str,
    user_ctx: UserContextDep,
    call_service: CallServiceDep,
):
    """
    Retrieve a call report for a call.

    Args:
        call_id (str): The ID of the call.
        user_ctx (UserContextDep): The user context dependency.
        call_service (CallServiceDep): The call service dependency.

    Returns:
        CallReport: The call report object.
        AnalyticsData: The analytics data object.
        dict: The response object containing the call report and analytics data.
    """
    if user_ctx.role == Role.ADMIN:
        call = call_service.get_call(call_id=call_id)
    else:
        call = call_service.get_call(call_id=call_id, user_id=user_ctx.id)

    if call is None:
        logger.error("Call not found")
        return raise_custom_exception(404, "Call not found")

    return {
        "report": json.loads(call.report or "{}"),
        "analytics": json.loads(call.analytics or "{}"),
    }


@router.get("/calls")
def get_calls(
    branch_id: str,
    user_ctx: UserContextDep,
    call_service: CallServiceDep,
) -> list[CallResponse]:
    """
    Retrieve calls for a specific branch.

    Args:
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context.
        call_service (CallServiceDep): The call service.

    Returns:
        List[Call]: The list of calls for the branch.
    """
    if user_ctx.role == Role.ADMIN:
        call_tuple = call_service.get_calls(branch_id=branch_id, snapshots=True)
    else:
        call_tuple = call_service.get_calls(
            branch_id=branch_id, snapshots=True, user_id=user_ctx.id
        )

    return [
        CallResponse(call=call, profile_snapshot=profile_snapshot)
        for call, profile_snapshot in call_tuple
    ]


@router.get("/calls/{call_id}")
def get_call(
    call_id: str,
    user_ctx: UserContextDep,
    call_service: CallServiceDep,
):
    """
    Retrieve a call by its ID.

    Args:
        call_id (str): The ID of the call.
        user_ctx (UserContextDep): The user context dependency.
        call_service (CallServiceDep): The call service dependency.

    Returns:
        CallResponse: The call response object.
    """
    if user_ctx.role == Role.ADMIN:
        call = call_service.get_call(call_id=call_id)
    else:
        call = call_service.get_call(call_id=call_id, user_id=user_ctx.id)

    if call is None:
        logger.error("Call not found")
        raise_custom_exception(404, "Call not found")

    return call


@router.get("/calls/{call_id}/download")
async def download(
    call_id: str,
    user_ctx: UserContextDep,
    call_service: CallServiceDep,
    agent_service: AgentServiceDep,
    retell_service: RetellAIServiceDep,
):
    """
    Download a call transcript.

    Args:
        call_id (str): The ID of the call.
        user_ctx (UserContextDep): The user context dependency.
        call_service (CallServiceDep): The call service dependency.
        agent_service (AgentServiceDep): The agent service dependency.
        retell_service (RetellAIServiceDep): The retell AI service dependency.

    Returns:
        Response: The response object containing the transcript.
    """
    if user_ctx.role == Role.ADMIN:
        call = call_service.get_call(call_id=call_id)
    else:
        call = call_service.get_call(call_id=call_id, user_id=user_ctx.id)

    if call is None:
        logger.error("Call not found")
        return raise_custom_exception(404, "Call not found")

    if call.transcript is None:
        logger.info("Transcript not generated yet")
        return JSONResponse(
            {"message": "Transcript not generated yet"}, status_code=200
        )

    text = generate_text_file(call)
    response = Response(content=text, media_type="text/plain")
    response.headers["Content-Disposition"] = f"attachment; filename={call.id}.txt"

    return response
