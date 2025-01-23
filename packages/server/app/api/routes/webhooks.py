import json
import logging

from fastapi import APIRouter, Request, status

from app.api.deps import CallServiceDep, EventServiceDep, RetellAIServiceDep
from app.api.routes.calls import report_generator
from app.models import EventType, InterviewData
from app.utils import timestamp_diff_to_ms

router = APIRouter(prefix="/webhooks")

logger = logging.getLogger("uvicorn")


@router.post("/retell")
async def handle_retell_events(
    req: Request,
    retell_service: RetellAIServiceDep,
    call_service: CallServiceDep,
    event_service: EventServiceDep,
):
    event_data = await req.json()

    # Once the call has ended, we generate a call report
    if event_data["event"] == "call_ended":
        call_id = event_data["data"]["metadata"]["call_id"]
        logger.info(f"Call ended event received. Generating report for call: {call_id}")
        transcript = event_data["data"]["transcript"]
        report_prompt = event_data["data"]["metadata"].get("report_prompt", None)
        duration = timestamp_diff_to_ms(
            start_timestamp=event_data["data"]["start_timestamp"],
            end_timestamp=event_data["data"]["end_timestamp"],
        )
        report = await report_generator(transcript, report_prompt)

        # EVENT: Call ended
        event_service.create_event(
            name=EventType.CALL_ENDED,
            data={
                "call_id": call_id,
                "lead_id": event_data["data"]["metadata"]["lead_id"],
                "retell_agent_id": event_data["data"]["metadata"]["retell_agent_id"],
                "profile_snapshot_id": event_data["data"]["metadata"][
                    "profile_snapshot_id"
                ],
                "start_timestamp": event_data["data"]["start_timestamp"],
                "end_timestamp": event_data["data"]["end_timestamp"],
                "duration": duration,
                "lead_type": event_data["data"]["metadata"]["lead_type"],
                "lead_status": event_data["data"]["metadata"]["lead_status"],
                "call_type": event_data["data"]["metadata"]["call_type"],
            },
            branch_id=event_data["data"]["metadata"]["branch_id"],
            org_id=event_data["data"]["metadata"]["org_id"],
        )
        call_metadata = {"duration": duration}
        call_service.update_call(
            call_id=call_id,
            call={
                "report": report.model_dump_json(),
                "transcript": transcript,
                "call_metadata": json.dumps(call_metadata),
            },
        )
        logger.info(f"Call {call_id} report generated")

    return status.HTTP_200_OK


@router.post("/cognicue")
async def handle_cognicue_events(
    req: Request,
    call_service: CallServiceDep,
):
    event = await req.json()
    call_id = event["candidate_email"].split("@")[0]

    logger.info(f"Cognicue event received: {call_id}")

    data = event["interviews"][0]
    status = data["interview_status"]

    if status == "COMPLETED":
        logger.info(
            f"Congnicue interview completed for call: {call_id}. Waiting for report to be processed"
        )
        partial_data = {"candidate_interview_id": call_id}
        interview = InterviewData(**partial_data)
        call_service.update_call(
            call_id=call_id,
            call={
                "analytics": interview.model_dump_json(),
            },
        )
        logger.info(f"Call {call_id} report updated with partial Cognicue data")
    elif status == "PROCESSED":
        logger.info(f"Congnicue interview processed for call: {call_id}")
        call_service.update_call(
            call_id=call_id,
            call={
                "analytics": json.dumps(data),
            },
        )
        logger.info(f"Call {call_id} report updated with Cognicue data")
    else:
        logger.info(f"Congnicue interview status: {status} for call: {call_id}")
