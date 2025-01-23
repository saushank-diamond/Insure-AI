from datetime import datetime, timezone

from sqlmodel import Session, desc, select

from app.models import (
    Call,
    ObjectType,
    ProfileSnapshot,
    get_id,
)


class CallService:
    """
    Service class for managing calls.
    """

    def __init__(self, db: Session):
        """
        Initializes the CallService class with a database session.

        Args:
            db (Session): The database session to be used for database operations.
        """
        self.db = db

    def create_call(
        self,
        user_id: str,
        lead_id: str,
        profile_snapshot_id: str,
        branch_id: str,
        org_id: str,
        agent_id: str,
        caller_name: str,
        call_metadata=None,
        prompt_id: str = None,
    ):
        """
        Creates a new call object and saves it to the database.

        Args:
            user_id (str): The ID of the user associated with the call.
            lead_id (str): The ID of the lead associated with the call.
            profile_snapshot_id (str): The ID of the profile snapshot associated with the call.
            branch_id (str): The ID of the branch associated with the call.
            org_id (str): The ID of the organization associated with the call.
            agent_id (str): The ID of the agent associated with the call.
            caller_name (str): The name of the caller.
            call_metadata (Optional): Additional metadata for the call (default: None).
            prompt_id (str): The ID of the prompt associated with the call (default: None).

        Returns:
            The created call object.

        """
        db_obj = Call.model_validate(
            {
                "organization_id": org_id,
                "branch_id": branch_id,
                "lead_id": lead_id,
                "profile_snapshot_id": profile_snapshot_id,
                "user_id": user_id,
                "caller_name": caller_name,
                "agent_id": agent_id,
                "prompt_id": prompt_id,
                "call_metadata": call_metadata,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
                "call_timestamp": datetime.now(tz=timezone.utc),
            },
            update={"id": get_id(ObjectType.CALL)},
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_call(
        self,
        lead_id: str = None,
        call_id: str = None,
        snapshots: bool = False,
        user_id: str = None,
    ):
        """
        Retrieve a call by its ID.
        Args:
            lead_id (str, optional): The ID of the lead associated with the call. Defaults to None.
            call_id (str, optional): The ID of the call. Defaults to None.
            snapshots (bool, optional): Whether to include call snapshots. Defaults to False.
            user_id (str, optional): The ID of the user associated with the call. Defaults to None.

        Returns:
            Call: The call object, or None if not found.
        """
        where_clause = (Call.deleted_at == None,)

        if call_id:
            where_clause += (Call.id == call_id,)
        if user_id:
            where_clause += (Call.user_id == user_id,)
        if lead_id:
            where_clause += (Call.lead_id == lead_id,)

        query = select(Call).where(*where_clause)

        return self.db.exec(query).one_or_none()

    def get_calls(self, branch_id: str, snapshots: bool = False, user_id: str = None):
        """
        Retrieve all calls for a given branch.

        Args:
            branch_id (str): The ID of the branch.
            snapshots (bool, optional): Whether to include call snapshots. Defaults to False.
            user_id (str, optional): The ID of the user associated with the calls. Defaults to None.

        Returns:
            List[Call]: A list of call objects.
        """
        where_clause = (
            Call.branch_id == branch_id,
            Call.deleted_at == None,
        )

        if user_id:
            where_clause += (Call.user_id == user_id,)

        if snapshots:
            query = (
                select(Call, ProfileSnapshot)
                .join(ProfileSnapshot)
                .where(
                    *where_clause,
                    ProfileSnapshot.deleted_at == None,
                )
                .order_by(desc(Call.created_at))
            )
        else:
            query = select(Call).where(*where_clause).order_by(desc(Call.created_at))

        return self.db.exec(query).all()

    def update_call(self, call_id: str, call: dict):
        """
        Update a call.

        Args:
            call_id (str): The ID of the call to update.
            call (dict): The updated call data.

        Returns:
            bool: True if the call was updated successfully, False otherwise.
        """
        _call = self.get_call(call_id=call_id)
        if _call is None:
            return False

        _call.sqlmodel_update(
            call, update={"updated_at": datetime.now(tz=timezone.utc)}
        )
        self.db.add(_call)
        self.db.commit()
        self.db.refresh(_call)
        return True
