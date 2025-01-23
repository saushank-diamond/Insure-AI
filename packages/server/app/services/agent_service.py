from datetime import datetime, timezone

from sqlmodel import Session, select

from app.models import (
    Agent,
    ObjectType,
    get_id,
)


class AgentService:
    """
    Service class for managing agents.
    """

    def __init__(self, db: Session):
        """
        Initializes the AgentService class with a database session.

        Args:
            db (Session): The database session to be used for database operations.
        """
        self.db = db

    def create_agent(
        self,
        org_id: str,
        branch_id: str,
        lead_id: str,
        retell_llm_id: str,
        retell_agent_id: str,
    ):
        """
        Creates a new agent.

        Args:
            org_id (str): The ID of the organization.
            branch_id (str): The ID of the branch.
            lead_id (str): The ID of the lead.
            retell_llm_id (str): The ID of the Retell LLM.
            retell_agent_id (str): The ID of the Retell agent.

        Returns:
            Agent: The created agent object.
        """
        db_obj = Agent.model_validate(
            {
                "organization_id": org_id,
                "branch_id": branch_id,
                "lead_id": lead_id,
                "retell_llm_id": retell_llm_id,
                "retell_agent_id": retell_agent_id,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
            update={"id": get_id(ObjectType.AGENT)},
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_agent(self, lead_id: str):
        """
        Retrieve an agent by its lead ID.

        Args:
            lead_id (str): The ID of the lead.

        Returns:
            Agent: The agent object, or None if not found.
        """
        query = select(Agent).where(Agent.lead_id == lead_id)
        return self.db.exec(query).one_or_none()
