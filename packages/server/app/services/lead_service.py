import json
from datetime import datetime, timezone

from sqlmodel import Session, desc, select

from app.models import (
    Lead,
    LeadType,
    ObjectType,
    Profile,
    ProfileSnapshot,
    get_id,
)


class LeadService:
    """
    Service class for managing leads.
    """

    def __init__(self, db: Session):
        """
        Initializes the LeadService class with a database session.

        Args:
            db (Session): The database session to be used for database operations.
        """
        self.db = db

    def create_lead(
        self,
        org_id: str,
        branch_id: str,
        type: LeadType,
        created_by_id: str,
        created_by_name: str,
    ):
        """
        Creates a new lead in the database.

        Args:
            org_id (str): The ID of the organization the lead belongs to.
            branch_id (str): The ID of the branch the lead belongs to.
            type (LeadType): The type of the lead.
            created_by_id (str): The ID of the user who created the lead.
            created_by_name (str): The name of the user who created the lead.

        Returns:
            Lead: The created lead object.
        """
        db_obj = Lead.model_validate(
            {
                "organization_id": org_id,
                "branch_id": branch_id,
                "type": type,
                "created_by_id": created_by_id,
                "created_by_name": created_by_name,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
            update={"id": get_id(ObjectType.LEAD)},
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def create_profile(self, profile: dict, org_id: str, branch_id: str, lead_id: str):
        """
        Creates a new profile for a lead in the database.

        Args:
            profile (dict): A dictionary containing the details of the profile.
            org_id (str): The ID of the organization the profile belongs to.
            branch_id (str): The ID of the branch the profile belongs to.
            lead_id (str): The ID of the lead the profile belongs to.

        Returns:
            Profile: The created profile object.
        """
        db_obj = Profile.model_validate(
            profile,
            update={
                "id": get_id(ObjectType.PROFILE),
                "lead_id": lead_id,
                "branch_id": branch_id,
                "organization_id": org_id,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_leads(self, branch_id: str, created_by_id: str = None):
        """
        Retrieves all the leads for a given branch.

        Args:
            branch_id (str): The ID of the branch to retrieve the leads for.
            created_by_id (str): The ID of the user to filter the leads by.

        Returns:
            List[Lead]: A list of lead objects.
        """
        where_clause = (
            Lead.deleted_at == None,
            Profile.deleted_at == None,
            Lead.branch_id == branch_id,
        )

        if created_by_id:
            where_clause += (Lead.created_by_id == created_by_id,)

        query = (
            select(Profile, Lead)
            .join(Lead)
            .where(*where_clause)
            .order_by(desc(Lead.created_at))
        )

        return self.db.exec(query).all()

    def get_lead(self, lead_id: str, created_by_id: str = None):
        """
        Retrieve a lead from the database based on the given lead_id.

        Args:
            lead_id (str): The ID of the lead to retrieve.
            created_by_id (str): The ID of the user to filter the leads by.

        Returns:
            Union[None, Tuple[Profile, Lead]]: A tuple containing the Profile and Lead objects
            associated with the lead_id, or None if no lead is found.
        """
        where_clause = (
            Lead.deleted_at == None,
            Profile.deleted_at == None,
            Lead.id == lead_id,
        )

        if created_by_id:
            where_clause += (Lead.created_by_id == created_by_id,)

        query = select(Profile, Lead).join(Lead).where(*where_clause)

        return self.db.exec(query).one_or_none()

    def update_lead(self, lead, profile):
        """
        Updates a lead and its associated profile in the database.

        Args:
            lead (Lead): The lead object to update.
            profile (Profile): The profile object to update.

        Returns:
            Tuple[Lead, Profile]: The updated lead and profile objects.
        """
        self.db.add_all([lead, profile])
        self.db.commit()
        self.db.refresh(lead)
        self.db.refresh(profile)
        return lead, profile

    def delete_lead(self, lead_id: str, created_by_id: str = None):
        """
        Deletes a lead and its associated profile from the database.

        Args:
            lead_id (str): The ID of the lead to delete.
            created_by_id (str): The ID of the user to filter the leads by.

        Returns:
            bool: True if the lead was successfully deleted, False otherwise.
        """
        try:
            if created_by_id:
                profile, lead = self.get_lead(lead_id, created_by_id=created_by_id)
            else:
                profile, lead = self.get_lead(lead_id)

            if profile and lead:
                lead.sqlmodel_update({"deleted_at": datetime.now(tz=timezone.utc)})
                profile.sqlmodel_update({"deleted_at": datetime.now(tz=timezone.utc)})
                self.db.add_all([lead, profile])
                self.db.commit()
                self.db.refresh(lead)
                self.db.refresh(profile)
                return True
        except Exception as e:
            print(f"Error deleting lead: {e}")
            return False

    def create_profile_snapshot(
        self, lead_id: str, profile: Profile = None, lead: Lead = None
    ) -> ProfileSnapshot:
        """
        Creates a profile snapshot for the given lead.

        Args:
            lead_id (str): The ID of the lead.
            profile (Profile, optional): The profile object. Defaults to None.
            lead (Lead, optional): The lead object. Defaults to None.

        Returns:
            ProfileSnapshot: The created profile snapshot object.
        """
        if profile is None:
            profile, lead = self.get_lead(lead_id)

        data = json.dumps(
            {"lead": lead.model_dump_json(), "profile": profile.model_dump_json()}
        )
        db_obj = ProfileSnapshot.model_validate(
            {
                "lead_id": lead_id,
                "branch_id": profile.branch_id,
                "organization_id": profile.organization_id,
                "data": data,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
            update={"id": get_id(ObjectType.PROFILE_SNAPSHOT)},
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_profile_snapshot(self, profile_snapshot_id: str):
        """
        Retrieves a profile snapshot from the database based on the given profile_snapshot_id.

        Args:
            profile_snapshot_id (str): The ID of the profile snapshot to retrieve.

        Returns:
            ProfileSnapshot: The retrieved profile snapshot object.
        """
        query = select(ProfileSnapshot).where(
            ProfileSnapshot.id == profile_snapshot_id,
            ProfileSnapshot.deleted_at == None,
        )
        return self.db.exec(query).one_or_none()
