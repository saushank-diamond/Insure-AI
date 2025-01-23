from datetime import datetime, timezone

from sqlmodel import Session, select

from app.models import (
    Event,
    EventType,
    ObjectType,
    get_id,
)


class EventService:
    """
    Service class for managing events.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_event(
        self,
        name: EventType,
        data: any,
        branch_id: str,
        org_id: str,
    ):
        """
        Creates a new event and saves it to the database.

        Args:
            name (EventType): The type of the event.
            data (any): The data associated with the event.
            branch_id (str): The ID of the branch associated with the event.
            org_id (str): The ID of the organization associated with the event.

        Returns:
            The created event object.
        """
        db_obj = Event.model_validate(
            {
                "organization_id": org_id,
                "branch_id": branch_id,
                "name": name,
                "data": data,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
            update={"id": get_id(ObjectType.EVENT)},
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_events(self, name: EventType, org_id: str, branch_id: str):
        """
        Retrieves events from the database based on the given criteria.

        Args:
            name (EventType): The type of the events to retrieve.
            org_id (str): The ID of the organization associated with the events.
            branch_id (str): The ID of the branch associated with the events.

        Returns:
            A list of event objects matching the given criteria.
        """
        query = select(Event).where(
            Event.organization_id == org_id,
            Event.branch_id == branch_id,
            Event.name == name,
        )
        return self.db.exec(query).all()
