from datetime import datetime, timezone

from sqlmodel import Session, select, update

from app.models import LeadStatus, ObjectType, Prompt, PromptType, get_id


class PromptService:
    """
    Service class for managing prompts.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_prompt(
        self,
        name: str,
        prompt: str,
        org_id: str,
        branch_id: str,
        user_id: str,
        created_by_name: str,
        known_to_agent: str = None,
        meeting_status: LeadStatus = None,
        prompt_type: PromptType = PromptType.CONVERSATION,
        report_prompt_text: str | None = "",
        description: str = "",
    ):
        """
        Create a new prompt.

        Args:
            name (str): The name of the prompt.
            prompt (str): The text of the prompt.
            org_id (str): The ID of the organization.
            branch_id (str): The ID of the branch.
            user_id (str): The ID of the user.
            created_by_name (str): The name of the user who created the prompt.
            known_to_agent (str, optional): Whether the prompt is known to the agent. Defaults to None.
            meeting_status (LeadStatus, optional): The meeting status associated with the prompt. Defaults to None.
            prompt_type (PromptType, optional): The type of prompt. Defaults to PromptType.CONVERSATION.
            report_prompt_text (str, optional): The text of the report prompt. Defaults to None.

        Returns:
            Prompt: The created prompt object.
        """
        db_obj = Prompt.model_validate(
            {
                "text": prompt,
                "name": name,
                "created_by": user_id,
                "organization_id": org_id,
                "branch_id": branch_id,
                "created_by_name": created_by_name,
                "known_to_agent": known_to_agent,
                "meeting_status": meeting_status,
                "prompt_type": prompt_type,
                "report_prompt_text": report_prompt_text,
                "description": description,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
            update={"id": get_id(ObjectType.PROMPT)},
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_prompts(self, branch_id: str):
        """
        Get all prompts for a given branch.

        Args:
            branch_id (str): The ID of the branch.

        Returns:
            List[Prompt]: A list of prompt objects.
        """
        query = select(Prompt).where(
            Prompt.branch_id == branch_id,
            Prompt.deleted_at == None,  # noqa: E711
        )
        return self.db.exec(query).all()

    def get_prompt(self, prompt_id: str):
        """
        Get a prompt by its ID.

        Args:
            prompt_id (str): The ID of the prompt.

        Returns:
            Prompt: The prompt object, or None if not found.
        """
        query = select(Prompt).where(
            Prompt.id == prompt_id,
            Prompt.deleted_at == None,  # noqa: E711
        )
        return self.db.exec(query).one_or_none()

    def update_prompt(self, prompt: Prompt):
        """
        Update a prompt.

        Args:
            prompt (Prompt): The prompt object to update.

        Returns:
            Prompt: The updated prompt object.
        """
        self.db.add(prompt)
        self.db.commit()
        self.db.refresh(prompt)
        return prompt

    def delete_prompt(self, prompt_id: str):
        """
        Delete a prompt.

        Args:
            prompt_id (str): The ID of the prompt to delete.

        Returns:
            bool: True if the prompt was successfully deleted, False otherwise.
        """
        try:
            prompt = self.get_prompt(prompt_id)
            prompt.sqlmodel_update({"deleted_at": datetime.now(tz=timezone.utc)})
            self.db.add(prompt)
            self.db.commit()
            self.db.refresh(prompt)
            return True
        except Exception as e:
            print(f"Error deleting prompt: {e}")
            return False

    def set_default_prompt(self, prompt_id: str):
        """
        Set a prompt as the default prompt for a given prompt type.

        Args:
            prompt_id (str): The ID of the prompt to set as default.

        Returns:
            bool: True if the prompt was successfully set as default, False otherwise.
        """
        try:
            # Get the prompt to be set as default
            prompt = self.get_prompt(prompt_id)
            if not prompt:
                return False

            # Unset all other prompts of the same type as non-default
            self.db.exec(
                update(Prompt)
                .where(
                    Prompt.prompt_type == prompt.prompt_type,
                    Prompt.branch_id == prompt.branch_id,
                    Prompt.id != prompt_id,
                    Prompt.deleted_at == None,  # noqa: E711
                )
                .values(is_default=False)
            )

            # Set the selected prompt as default
            prompt.is_default = True

            self.db.add(prompt)
            self.db.commit()
            self.db.refresh(prompt)
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Error setting prompt as default: {e}")
            return False
