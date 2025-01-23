import logging
from datetime import datetime

import pytz
from fastapi import APIRouter

from app.api.deps import (
    MetricsServiceDep,
    UserContextDep,
)

router = APIRouter()

logger = logging.getLogger("uvicorn")


@router.get("/metrics/counts")
def get_metrics(
    start_date: datetime,
    end_date: datetime,
    branch_id: str,
    user_ctx: UserContextDep,
    metrics_service: MetricsServiceDep,
):
    """
    Retrieves metrics for a given branch.

    Args:
        start_date (datetime): The start date of the metrics period.
        end_date (datetime): The end date of the metrics period.
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context.
        metrics_service (MetricsServiceDep): The metrics service.

    Returns:
        funnel_metrics (dict): A dictionary containing the funnel metrics.
        call_metrics (dict): A dictionary containing the call metrics.
    """
    logger.info(
        f"Retrieving metrics for branch {branch_id} from {start_date} to {end_date}"
    )
    if start_date.tzinfo is None or end_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=pytz.timezone("UTC"))
        end_date = end_date.replace(tzinfo=pytz.timezone("UTC"))
    else:
        if start_date.tzinfo.utcoffset(start_date) is not None:
            start_date = start_date.astimezone(pytz.utc)
        if end_date.tzinfo.utcoffset(end_date) is not None:
            end_date = end_date.astimezone(pytz.utc)

    funnel_metrics = metrics_service.get_funnel_metrics(
        start_date=start_date, end_date=end_date, branch_id=branch_id
    )
    call_metrics = metrics_service.get_call_metrics(
        start_date=start_date, end_date=end_date, branch_id=branch_id
    )
    return funnel_metrics, call_metrics


@router.get("/metrics/graphs")
def get_metrics_graph(
    start_date: datetime,
    end_date: datetime,
    granularity: str,
    branch_id: str,
    user_ctx: UserContextDep,
    metrics_service: MetricsServiceDep,
):
    """
    Retrieves metrics for a given branch.

    Args:
        start_date (datetime): The start date of the metrics period.
        end_date (datetime): The end date of the metrics period.
        branch_id (str): The ID of the branch.
        user_ctx (UserContextDep): The user context.
        metrics_service (MetricsServiceDep): The metrics service.

    Returns:
        call_graph_metrics (dict): A dictionary containing the call graph metrics.
    """
    logger.info(
        f"Retrieving metrics graph for branch {branch_id} from {start_date} to {end_date} with granularity {granularity}"
    )
    if start_date.tzinfo is None or end_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=pytz.timezone("UTC"))
        end_date = end_date.replace(tzinfo=pytz.timezone("UTC"))
    else:
        if start_date.tzinfo.utcoffset(start_date) is not None:
            start_date = start_date.astimezone(pytz.utc)
        if end_date.tzinfo.utcoffset(end_date) is not None:
            end_date = end_date.astimezone(pytz.utc)

    call_graph_metrics = metrics_service.get_call_graph_metrics(
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
        branch_id=branch_id,
    )
    return call_graph_metrics


@router.get("/metrics/trends/funnel")
def get_funnel_metrics_trends(
    start_date: datetime,
    end_date: datetime,
    branch_id: str,
    metrics_service: MetricsServiceDep,
):
    """
    Retrieves metrics trends for a given branch.

    Args:
        start_date (datetime): The start date of the metrics period.
        end_date (datetime): The end date of the metrics period.
        branch_id (str): The ID of the branch.

    Returns:
        funnel_trends (dict): A dictionary containing the funnel trends.
        call_trends (dict): A dictionary containing the call trends.
    """
    if start_date.tzinfo is None or end_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=pytz.timezone("UTC"))
        end_date = end_date.replace(tzinfo=pytz.timezone("UTC"))
    else:
        if start_date.tzinfo.utcoffset(start_date) is not None:
            start_date = start_date.astimezone(pytz.utc)
        if end_date.tzinfo.utcoffset(end_date) is not None:
            end_date = end_date.astimezone(pytz.utc)

    funnel_trends = metrics_service.get_funnel_metrics_with_trends(
        start_date=start_date, end_date=end_date, branch_id=branch_id
    )
    return funnel_trends


@router.get("/metrics/trends/call")
def get_call_metrics_trends(
    start_date: datetime,
    end_date: datetime,
    branch_id: str,
    metrics_service: MetricsServiceDep,
):
    """
    Retrieves metrics trends for a given branch.

    Args:
        start_date (datetime): The start date of the metrics period.
        end_date (datetime): The end date of the metrics period.
        branch_id (str): The ID of the branch.

    Returns:
        funnel_trends (dict): A dictionary containing the funnel trends.
        call_trends (dict): A dictionary containing the call trends.
    """
    if start_date.tzinfo is None or end_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=pytz.timezone("UTC"))
        end_date = end_date.replace(tzinfo=pytz.timezone("UTC"))
    else:
        if start_date.tzinfo.utcoffset(start_date) is not None:
            start_date = start_date.astimezone(pytz.utc)
        if end_date.tzinfo.utcoffset(end_date) is not None:
            end_date = end_date.astimezone(pytz.utc)

    call_trends = metrics_service.get_call_metrics_with_trends(
        start_date=start_date, end_date=end_date, branch_id=branch_id
    )["call_trends"]
    return call_trends
