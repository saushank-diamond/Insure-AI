from datetime import datetime

import pytz
from sqlalchemy import text
from sqlmodel import Session


class MetricsService:
    """
    Service class for managing metrics.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_funnel_metrics(
        self, start_date: datetime, end_date: datetime, branch_id: str
    ):
        query = text(
            """
            SELECT
                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events 
                WHERE name = 'lead_created' 
                AND data->>'type' = 'suspect' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_lead_created_suspect,

                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events 
                WHERE name = 'lead_status_updated' 
                AND data->>'status' = 'Yet to Contact' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_lead_status_yet_to_contact,

                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events 
                WHERE name = 'lead_status_updated' 
                AND data->>'status' = 'Contacted & Dropped' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_lead_status_contacted_dropped,

                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events 
                WHERE name = 'lead_status_updated' 
                AND data->>'status' = '1st Meeting Scheduled' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_1st_meeting_scheduled,

                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events 
                WHERE name = 'lead_status_updated' 
                AND data->>'status' = '1st Meeting Completed' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_1st_meeting_completed,

                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events
                WHERE name = 'lead_status_updated' 
                AND data->>'status' = '2nd Meeting Scheduled' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_2nd_meeting_scheduled,

                (SELECT COUNT(DISTINCT data->>'lead_id') FROM events 
                WHERE name = 'lead_status_updated' 
                AND data->>'status' = 'Call Closed' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_call_closed
            """
        )

        params = {
            "branch_id": branch_id,
            "start_date": start_date,
            "end_date": end_date,
        }

        result = self.db.exec(query, params=params).one()

        return {
            "lead_created_suspect": result.event_count_lead_created_suspect,
            "lead_status_yet_to_contact": result.event_count_lead_status_yet_to_contact,
            "lead_status_contacted_dropped": result.event_count_lead_status_contacted_dropped,
            "first_meeting_scheduled": result.event_count_1st_meeting_scheduled,
            "first_meeting_completed": result.event_count_1st_meeting_completed,
            "second_meeting_scheduled": result.event_count_2nd_meeting_scheduled,
            "call_closed": result.event_count_call_closed,
        }

    def get_call_metrics(
        self, start_date: datetime, end_date: datetime, branch_id: str
    ):
        query = text(
            """
            SELECT
                (SELECT COUNT(*) FROM events 
                WHERE name = 'call_started' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_call_started,

                (SELECT COUNT(*) FROM events 
                WHERE name = 'call_started' 
                AND data->>'call_type' = 'appointment_call' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_appointment_call,

                (SELECT COUNT(*) FROM events 
                WHERE name = 'call_started' 
                AND data->>'call_type' = 'meeting_call' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS event_count_meeting_call,

                (SELECT SUM(EXTRACT('epoch' FROM cast(data->>'duration' AS INTERVAL)) / 60) FROM events 
                WHERE name = 'call_ended' 
                AND branch_id = :branch_id 
                AND created_at BETWEEN :start_date AND :end_date) AS duration_sum
            """
        )

        params = {
            "branch_id": branch_id,
            "start_date": start_date,
            "end_date": end_date,
        }

        result = self.db.exec(query, params=params).one()

        return {
            "event_count_call_started": result.event_count_call_started,
            "event_count_appointment_call": result.event_count_appointment_call,
            "event_count_meeting_call": result.event_count_meeting_call,
            "duration_sum": result.duration_sum,
        }

    def calculate_trend_percentage(
        self, current_count: int, previous_count: int
    ) -> float:
        if previous_count is None or previous_count == 0:
            return 100.0 if current_count is not None and current_count > 0 else 0.0
        elif current_count is None:
            return None  # or any appropriate default value
        else:
            return ((current_count - previous_count) / previous_count) * 100

    def get_funnel_metrics_with_trends(
        self, start_date: datetime, end_date: datetime, branch_id: str
    ):
        # Calculate the previous period
        period_delta = end_date - start_date
        previous_start_date = start_date - period_delta
        previous_end_date = end_date - period_delta

        # Fetch current and previous metrics
        current_funnel_metrics = self.get_funnel_metrics(
            start_date, end_date, branch_id
        )
        previous_funnel_metrics = self.get_funnel_metrics(
            previous_start_date, previous_end_date, branch_id
        )

        # Calculate trends for funnel metrics
        funnel_trends = {
            key: self.calculate_trend_percentage(
                current_funnel_metrics[key], previous_funnel_metrics[key]
            )
            for key in current_funnel_metrics
        }

        return {
            "funnel_trends": funnel_trends,
        }

    def get_call_metrics_with_trends(
        self, start_date: datetime, end_date: datetime, branch_id: str
    ):
        # Calculate the previous period
        period_delta = end_date - start_date
        previous_start_date = start_date - period_delta
        previous_end_date = end_date - period_delta

        current_call_metrics = self.get_call_metrics(start_date, end_date, branch_id)
        previous_call_metrics = self.get_call_metrics(
            previous_start_date, previous_end_date, branch_id
        )

        # Calculate trends for call metrics
        call_trends = {
            key: self.calculate_trend_percentage(
                current_call_metrics[key], previous_call_metrics[key]
            )
            for key in current_call_metrics
        }

        return {
            "call_trends": call_trends,
        }

    def get_call_graph_metrics(
        self, start_date: datetime, end_date: datetime, granularity: str, branch_id: str
    ):
        start_date_str = start_date.replace(tzinfo=pytz.utc).isoformat()
        end_date_str = end_date.replace(tzinfo=pytz.utc).isoformat()

        query_call_count = """
            SELECT DATE_TRUNC(:granularity, created_at) AS event_date,
                COUNT(*) AS call_count
            FROM events
            WHERE name = 'call_started'
            AND branch_id = :branch_id
            AND created_at BETWEEN :start_date AND :end_date
            GROUP BY DATE_TRUNC(:granularity, created_at)
            ORDER BY DATE_TRUNC(:granularity, created_at)
        """

        query_total_duration_minutes = """
            SELECT DATE_TRUNC(:granularity, created_at) AS event_date,
                SUM(EXTRACT('epoch' FROM cast(data->>'duration' AS INTERVAL)) / 60) AS total_duration_minutes
            FROM events
            WHERE name = 'call_ended'
            AND branch_id = :branch_id
            AND created_at BETWEEN :start_date AND :end_date
            GROUP BY DATE_TRUNC(:granularity, created_at)
            ORDER BY DATE_TRUNC(:granularity, created_at)
        """

        params = {
            "start_date": start_date_str,
            "end_date": end_date_str,
            "branch_id": branch_id,
            "granularity": granularity,
        }

        result_call_count = [
            dict(zip(row._fields, row))
            for row in self.db.exec(text(query_call_count), params=params)
        ]
        result_total_duration_minutes = [
            dict(zip(row._fields, row))
            for row in self.db.exec(text(query_total_duration_minutes), params=params)
        ]

        return {
            "call_count": result_call_count,
            "total_duration_minutes": result_total_duration_minutes,
        }
