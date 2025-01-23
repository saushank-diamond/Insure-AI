from datetime import datetime, timezone

from sqlmodel import Session, select

from app.models import (
    Branch,
    CreateBranchRequest,
    CreateOrganizationRequest,
    Invite,
    InviteStatus,
    ObjectType,
    Organization,
    Role,
    User,
    UserBranchMapping,
    get_id,
)


class OrganizationService:
    """
    Service class for managing organizations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_organization(self, org: CreateOrganizationRequest) -> Organization:
        """
        Creates a new organization in the database.

        Args:
            org (CreateOrganizationRequest): The organization details.

        Returns:
            User: The created organization object.
        """
        db_obj = Organization.model_validate(
            org.model_dump(),
            update={
                "id": get_id(ObjectType.ORGANIZATION),
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_organization_by_id(self, org_id: str) -> Organization | None:
        """
        Retrieves an organization from the database based on its ID.

        Args:
            org_id (str): The ID of the organization).

        Returns:
            Organization: The organization object if found, None otherwise.
        """
        query = select(Organization).where(Organization.id == org_id)
        return self.db.exec(query).first()

    def create_branch(self, branch: CreateBranchRequest, org_id: str) -> Branch:
        """
        Creates a new branch in the database.

        Args:
            branch (CreateBranchRequest): The branch details.

        Returns:
            Branch: The created branch object.
        """
        db_obj = Branch.model_validate(
            branch.model_dump(),
            update={
                "id": get_id(ObjectType.BRANCH),
                "organization_id": org_id,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def add_user_to_branch(self, branch_id: int, user_id: int):
        """
        Adds a user to a branch in the database.

        Args:
            branch_id (int): The ID of the branch.
            user_id (int): The ID of the user.

        Returns:
            UserBranchMapping: The created user-branch mapping object.
        """
        db_obj = UserBranchMapping.model_validate(
            {
                "id": get_id(ObjectType.USER_BRANCH_MAPPING),
                "branch_id": branch_id,
                "user_id": user_id,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            }
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_branch_by_id(self, branch_id: str) -> Branch | None:
        """
        Retrieve a branch by its ID.

        Args:
            branch_id (str): The ID of the branch.

        Returns:
            Branch | None: The branch object if found, None otherwise.
        """

        query = select(Branch).where(Branch.id == branch_id)
        return self.db.exec(query).first()

    def get_invite(self, token: str) -> Invite | None:
        """
        Retrieve an invite by its token.

        Args:
            token (str): The token of the invite.

        Returns:
            Invite | None: The invite object if found, None otherwise.
        """
        query = select(Invite).where(
            Invite.token == token,
            Invite.deleted_at == None,
        )
        return self.db.exec(query).first()

    def accept_invite(self, invite: Invite) -> bool:
        """
        Accepts an invite.

        Args:
            token (str): The token of the invite.
        """
        try:
            invite.sqlmodel_update(
                {
                    "status": InviteStatus.ACCEPTED,
                    "updated_at": datetime.now(tz=timezone.utc),
                }
            )
            self.db.add(invite)
            self.db.commit()
            self.db.refresh(invite)
            return True
        except Exception as e:
            print(f"Error accepting invite: {e}")
            return False

    def create_invite(
        self,
        email: str,
        org_id: str,
        branch_id: str,
        invited_by: str,
        role: Role,
        name: str,
        organization_name: str,
    ) -> Invite:
        """
        Creates a new invite.

        Args:
            email (str): The email of the invited user.
            org_id (str): The ID of the organization.
            branch_id (str): The ID of the branch.
            invited_by (str): The email of the user who invited the user.
            role (Role): The role of the invited user.
            name (str): The name of the invited user.

        Returns:
            Invite: The created invite object.
        """
        # Check if the user is already invited
        query = select(Invite).where(
            Invite.email == email,
            Invite.organization_id == org_id,
            Invite.branch_id == branch_id,
            Invite.deleted_at == None,
        )

        inv = self.db.exec(query).first()
        if inv is not None:
            return inv

        db_obj = Invite.model_validate(
            {
                "id": get_id(ObjectType.INVITE),
                "status": InviteStatus.PENDING,
                "email": email,
                "organization_id": org_id,
                "branch_id": branch_id,
                "invited_by": invited_by,
                "role": role,
                "token": get_id(ObjectType.INVITE),
                "name": name,
                "organization_name": organization_name,
                "created_at": datetime.now(tz=timezone.utc),
                "updated_at": datetime.now(tz=timezone.utc),
            },
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return db_obj

    def get_invites(self, org_id: str, branch_id: str) -> list[Invite]:
        """
        Get all invites for a given organization/branch.

        Args:
            org_id (str): The ID of the organization.
            branch_id (str): The ID of the branch.

        Returns:
            List[Invite]: A list of invites.
        """
        query = select(Invite).where(
            Invite.organization_id == org_id,
            Invite.branch_id == branch_id,
            Invite.deleted_at == None,
        )
        return self.db.exec(query).all()

    def get_members(self, org_id: str, branch_id: str):
        """
        Get all members for a given organization and branch.

        Args:
            org_id (str): The ID of the organization.
            branch_id (str): The ID of the branch.

        Returns:
            List[User]: A list of users.
        """
        query = select(
            User.id,
            User.object,
            User.created_at,
            User.updated_at,
            User.deleted_at,
            User.email,
            User.full_name,
            User.organization_id,
            User.current_branch_id,
            User.role,
            User.designation,
            User.is_active,
        ).where(
            User.organization_id == org_id,
            User.current_branch_id == branch_id,
            User.deleted_at == None,
        )
        return self.db.exec(query).all()

    def get_member(self, org_id: str, branch_id: str, email: str) -> User | None:
        """
        Get a member for a given organization and branch.

        Args:
            org_id (str): The ID of the organization.
            branch_id (str): The ID of the branch.
            email (str): The email of the user.

        Returns:
            User: The user object.
        """
        query = select(
            User.id,
            User.object,
            User.created_at,
            User.updated_at,
            User.deleted_at,
            User.email,
            User.full_name,
            User.organization_id,
            User.current_branch_id,
            User.role,
            User.designation,
            User.is_active,
        ).where(
            User.email == email,
            User.organization_id == org_id,
            User.current_branch_id == branch_id,
            User.deleted_at == None,
        )
        return self.db.exec(query).first()
