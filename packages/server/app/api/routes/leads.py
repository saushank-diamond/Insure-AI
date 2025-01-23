import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from app.api.deps import (
    AgentServiceDep,
    EventServiceDep,
    LeadServiceDep,
    RetellAIServiceDep,
    UserContextDep,
)
from app.core.config import settings
from app.models import (
    CreateLeadRequest,
    DeleteResponse,
    EventType,
    LeadResponse,
    LeadStatus,
    LeadType,
    Role,
    UpdateLeadRequest,
)
from app.utils import raise_custom_exception

router = APIRouter()

logger = logging.getLogger("uvicorn")


def get_system_prompt(known_to_agent=None):
    REFERRALS_PROMPT = """
Your first response to the agent will be "Yes tell me"

You are the AI agent tasked with simulating a realistic phone conversation with a human user, role-playing the persona provided

Your role is to act as a prospective customer while the user represents a life insurance sales agent.
Your role is not to play the sales agent but the prospective customer who has been called by the sales manager.

The sales agent knows you through a referral, meaning someone you know has interacted with the Sales Agent before.

The communication between you and the sales agent will revolve around the agent seeking an appointment to meet you, with you trying to understand why the sales agent wants to meet you.

If the sales agent acts salesy you can refuse the appointment

If the sales agent says "Is this a good time to talk", you can say no and ask the agent to call later.

If the sales agents talks to you about himself, his products, his  achievements you can get disinterested and refuse the appointment

If the sales agent mentions the jargon like payment terms, claim ratio, policy term, bonus, maturity, risk cover, premium, fund value you can get disinterested and eventually refuse the appointment after asking 1 or 2 generic questions.

You can get disinterested and refuse the appointment if the sales agent is rude.

If you are busy then you can ask the sales agent to call after sometime.
You will give an appointment when you see a value in why the sales agents want to meet you. You can ask the agent to explain the purpose of the meeting.
The Purpose of the meeting typically would be 1. understand your insurance needs 2. explain to you the ways to protect your future income 3. in general explain why someone needs insurance.

While giving the appointment the agent will ask you date, time and place of meeting, which you must provide

The conversation will end with you either giving an appointment or refusing an appointment based on the flow of the conversation.

Your persona to role-play is as follows:
```
{{persona}} age 40, income 10 lacs, male
{{custom_prompt}}
```
"""

    FRIENDS_PROMPT = """
Your role: You are a prospective customer who has been contacted by a life insurance sales agent. Your persona is a 40-year-old male with an annual income of 10 lacs. The sales agent is a friend of yours and both of you know each other well

Objective: Your goal is to simulate a realistic phone conversation with the sales agent. You'll engage in dialogue to either give an appointment or refuse it based on the agent's approach. The tone of the conversation would be friendly and non professional

Conversation Guidelines:

Approach to Appointment Setting:
If the sales agent is pushy on meeting, you can decline the meeting and ask to continue the conversation on the call itself.

If the sales agent says he will bring his boss along then you might get a bit jittery and ask why the boss he needed.
You'll show disinterest if the agent talks excessively about themselves, their products, or achievements and politely refuse.

As the agent is your friend you will give him a patient hearing, You can politely say no but agree to meet him for a cup of tea

Disinterest Triggers:
If the sales agent mentions insurance jargon like payment terms, claim ratio, policy term, etc., you'll express disinterest and eventually refuse the appointment after asking a few generic questions but always maintain a friendly demour.

Busy Schedule:
If you're busy, you'll ask the sales agent that you will  call back at a more convenient time.

Value-Based Appointment Setting:
You'll give ask questions so what exactly is the purpose of the meeting.

Appointment Details:
If you decide to give an appointment, the agent will ask for the date, time, and place of the meeting, which you must provide.
Conversation End: The conversation will end with you either giving an appointment or agreeing to meet but not actually interested in the dealing as far as insurance is concerned. The call will always end of a friendly note.

Role-play Persona: {{persona}} 40-year-old male, annual income of 10 lacs.
{{custom_prompt}}
"""

    if known_to_agent == "Friends":
        return FRIENDS_PROMPT
    else:
        return REFERRALS_PROMPT


def get_test_prompt():
    return "{{custom_prompt}}\n Persona: {{persona}}"


@router.post("/leads")
def create_lead(
    req: CreateLeadRequest,
    user_ctx: UserContextDep,
    lead_service: LeadServiceDep,
    agent_service: AgentServiceDep,
    retell_service: RetellAIServiceDep,
    event_service: EventServiceDep,
):
    """
    Create a new lead and associated profile.

    Args:
        req (CreateLeadRequest): The request object containing lead information.
        user_ctx (UserContextDep): The user context dependency.
        lead_service (LeadServiceDep): The lead service dependency.
        agent_service (AgentServiceDep): The agent service dependency.
        retell_service (RetellAIServiceDep): The retell AI service dependency.

    Returns:
        LeadResponse: The response object containing the created lead and profile.
    """

    logger.info(f"Creating lead with data: {req}")

    lead = lead_service.create_lead(
        org_id=user_ctx.organization_id,
        branch_id=req.branch_id,
        type=req.type,
        created_by_id=user_ctx.id,
        created_by_name=user_ctx.full_name,
    ).model_dump()
    profile = lead_service.create_profile(
        profile=req.profile,
        org_id=user_ctx.organization_id,
        branch_id=req.branch_id,
        lead_id=lead["id"],
    ).model_dump()

    logger.info(f"Lead created: {lead['id']}")

    # Create retell agent
    retell_llm = retell_service.llm.create(
        general_prompt=get_test_prompt(),  # TODO: this is for testing system prompt
        begin_message="Hello, who's this?",
    )
    retell_agent = retell_service.agent.create(
        llm_websocket_url=retell_llm.llm_websocket_url,
        agent_name=lead["id"],
        voice_id="11labs-Amritanshu",
        language="en-IN",
        webhook_url=f"{settings.WEBHOOK_URL}/retell",
        enable_backchannel=True,
    )
    agent_service.create_agent(
        org_id=user_ctx.organization_id,
        branch_id=req.branch_id,
        lead_id=lead["id"],
        retell_llm_id=retell_llm.llm_id,
        retell_agent_id=retell_agent.agent_id,
    )

    logger.info(f"Retell agent created for lead: {lead['id']}")

    # EVENT: Lead created
    event_service.create_event(
        name=EventType.LEAD_CREATED,
        data={"lead_id": lead["id"], "profile_id": profile["id"], "type": req.type},
        branch_id=req.branch_id,
        org_id=user_ctx.organization_id,
    )

    return LeadResponse(
        lead=lead,
        profile=profile,
    )


@router.get("/leads")
def get_leads(
    branch_id: str,
    user_ctx: UserContextDep,
    lead_service: LeadServiceDep,
):
    """
    Retrieve leads for a specific branch.

    Args:
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context dependency.
        lead_service (LeadServiceDep): The lead service dependency.

    Returns:
        List[LeadResponse]: A list of LeadResponse objects representing the leads for the branch.
    """
    if user_ctx.role == Role.ADMIN:
        leads = lead_service.get_leads(branch_id=branch_id)
    else:
        leads = lead_service.get_leads(branch_id=branch_id, created_by_id=user_ctx.id)

    return [
        LeadResponse(
            lead=lead,
            profile=profile,
        )
        for profile, lead in leads
    ]


@router.post("/leads/{lead_id}")
def update_lead(
    lead_id: str,
    req: UpdateLeadRequest,
    user_ctx: UserContextDep,
    lead_service: LeadServiceDep,
    retell_service: RetellAIServiceDep,
    agent_service: AgentServiceDep,
    event_service: EventServiceDep,
):
    """
    Update a lead and its associated profile.

    Args:
        lead_id (str): The ID of the lead to update.
        req (UpdateLeadRequest): The request object containing the updated lead and profile data.
        user_ctx (UserContextDep): The user context dependency.
        lead_service (LeadServiceDep): The lead service dependency.

    Returns:
        dict: A dictionary containing the updated lead and profile.

    Raises:
        CustomException: If the lead is not found.
    """
    if user_ctx.role == Role.ADMIN:
        profile_and_lead = lead_service.get_lead(lead_id)
    else:
        profile_and_lead = lead_service.get_lead(lead_id, created_by_id=user_ctx.id)

    if profile_and_lead is None:
        return raise_custom_exception(404, "Lead not found")

    profile, lead = profile_and_lead
    lead_req, profile_req = {}, {}

    if req.lead is not None:
        lead_req = req.lead.model_dump(exclude_unset=True)
    if req.profile is not None:
        profile_req = req.profile.model_dump(exclude_unset=True)

    # Make sure we don't allow updates to specific fields
    restricted_fields = [
        "id",
        "object",
        "created_at",
        "updated_at",
        "deleted_at",
        "branch_id",
        "organization_id",
        "lead_id",
    ]
    for field in restricted_fields:
        if field in lead_req:
            del lead_req[field]
        if field in profile_req:
            del profile_req[field]

    if (
        lead_req.get("known_to_agent") is not None
        and lead_req["known_to_agent"] != lead.known_to_agent
    ):
        llm_id = agent_service.get_agent(lead.id).retell_llm_id
        # retell_service.llm.update(
        #     llm_id, general_prompt=get_system_prompt(lead_req["known_to_agent"])
        # )
        # TODO: only for testing
        retell_service.llm.update(llm_id, general_prompt=get_test_prompt())

    if (
        lead_req.get("status") == LeadStatus.FIRST_MEETING_SCHEDULED
        and lead_req.get("meeting_date") is not None
    ):
        lead_req["type"] = LeadType.PROSPECT
        logger.info("Suspect succesfully converted to prospect")

    lead.sqlmodel_update(lead_req, update={"updated_at": datetime.now(tz=timezone.utc)})
    profile.sqlmodel_update(
        profile_req, update={"updated_at": datetime.now(tz=timezone.utc)}
    )
    updated_lead, updated_profile = lead_service.update_lead(lead, profile)
    logger.info(f"Lead updated: {updated_lead}")

    # EVENT: Lead type updated
    if lead_req.get("type") is not None:
        event_service.create_event(
            name=EventType.LEAD_TYPE_UPDATED,
            data={
                "lead_id": updated_lead.id,
                "profile_id": updated_profile.id,
                "type": updated_lead.type,
            },
            org_id=user_ctx.organization_id,
            branch_id=updated_lead.branch_id,
        )
        logger.info("Lead type updated event logged")

    # EVENT: Lead status updated
    if lead_req.get("status") is not None:
        event_service.create_event(
            name=EventType.LEAD_STATUS_UPDATED,
            data={
                "lead_id": updated_lead.id,
                "profile_id": updated_profile.id,
                "status": updated_lead.status,
            },
            org_id=user_ctx.organization_id,
            branch_id=updated_lead.branch_id,
        )
        logger.info("Lead status updated event logged")

    return LeadResponse(
        lead=updated_lead,
        profile=updated_profile,
    )


@router.get("/leads/{lead_id}")
def get_lead(
    lead_id: str,
    user_ctx: UserContextDep,
    lead_service: LeadServiceDep,
):
    """
    Retrieve a lead by its ID.

    Args:
        lead_id (str): The ID of the lead to retrieve.
        user_ctx (UserContextDep): The user context dependency.
        lead_service (LeadServiceDep): The lead service dependency.

    Returns:
        LeadResponse: The response object containing the lead.

    Raises:
        CustomException: If the lead is not found.
    """
    if user_ctx.role == Role.ADMIN:
        retreived_lead = lead_service.get_lead(lead_id)
    else:
        retreived_lead = lead_service.get_lead(lead_id, created_by_id=user_ctx.id)

    if retreived_lead is None:
        return raise_custom_exception(404, "Lead not found")

    return LeadResponse(
        lead=retreived_lead[1],
        profile=retreived_lead[0],
    )


@router.delete("/leads/{lead_id}")
def delete_lead(
    lead_id: str,
    user_ctx: UserContextDep,
    lead_service: LeadServiceDep,
):
    """
    Delete a lead by its ID.

    Args:
        lead_id (str): The ID of the lead to delete.
        user_ctx (UserContextDep): The user context dependency.
        lead_service (LeadServiceDep): The lead service dependency.

    Returns:
        DeleteResponse: The response indicating whether the lead was successfully deleted.
    """
    if user_ctx.role == Role.ADMIN:
        result = lead_service.delete_lead(lead_id)
    else:
        result = lead_service.delete_lead(lead_id, created_by_id=user_ctx.id)

    return DeleteResponse(id=lead_id, deleted=result)
