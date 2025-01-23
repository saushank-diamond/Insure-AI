from datetime import datetime, timezone

from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.models import ObjectType, Role, User, UserRegisterRequest, get_id


class UserService:
    """
    Service class for managing user-related operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_user(
        self,
        user: UserRegisterRequest,
        org_id: int,
        role: Role,
    ) -> User:
        """
        Creates a new user.

        Args:
            user (UserRegisterRequest): The user registration request object.
            org_id (int): The ID of the organization.
            role (Role): The role of the user.

        Returns:
            User: The created user object.
        """
        db_obj = User.model_validate(
            user,
            update={
                "id": get_id(ObjectType.USER),
                "organization_id": org_id,
                "hashed_password": get_password_hash(user.password.get_secret_value()),
                "role": role,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_user_by_email(self, email: str):
        """
        Retrieves a user from the database based on their email.

        Args:
            email (str): The email of the user.

        Returns:
            User: The user object if found, None otherwise.
        """
        query = select(User).where(User.email == email)
        return self.db.exec(query).first()

    def get_user_by_id(self, user_id: str) -> User | None:
        """
        Retrieves an user from the database based on its ID.

        Args:
            user_id (int | str): The ID of the user.

        Returns:
            User: The user object if found, None otherwise.
        """

        query = select(User).where(User.id == user_id)
        return self.db.exec(query).first()

    def set_current_branch(self, user_id: str, branch_id: str) -> bool:
        """
        Sets the current branch for a user.

        Args:
            user_id (str): The ID of the user.
            branch_id (str): The ID of the branch.
        """
        user = self.get_user_by_id(user_id)
        if user is None:
            return False
        user.sqlmodel_update({"current_branch_id": branch_id})
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return True

    def update_user(self, user: User):
        """
        Updates a user in the database.

        Args:
            user (User): The user object to update.

        Returns:
            User: The updated user object.
        """
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
