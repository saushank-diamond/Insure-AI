from datetime import datetime, timezone
from enum import Enum

from nanoid import generate
from pydantic import BaseModel, EmailStr, SecretStr
from sqlalchemy import JSON, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, Text


class Role(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"


class Resource(str, Enum):
    ORGANIZATION = "organization"
    BRANCH = "branch"
    USER = "user"
    CALL = "call"
    LEAD = "lead"
    PROMPT = "prompt"
    METRIC = "metric"
    INVITE = "invite"


class Action(str, Enum):
    READ = "read"
    WRITE = "write"


# Define role-based access control (RBAC) structure
ROLE_PERMISSIONS = {
    Role.ADMIN: {
        Resource.ORGANIZATION: [Action.READ, Action.WRITE],
        Resource.BRANCH: [Action.READ, Action.WRITE],
        Resource.USER: [Action.READ, Action.WRITE],
        Resource.CALL: [Action.READ, Action.WRITE],
        Resource.LEAD: [Action.READ, Action.WRITE],
        Resource.PROMPT: [Action.READ, Action.WRITE],
        Resource.METRIC: [Action.READ, Action.WRITE],
        Resource.INVITE: [Action.READ, Action.WRITE],
    },
    Role.MANAGER: {
        Resource.ORGANIZATION: [Action.READ, Action.WRITE],
        Resource.BRANCH: [Action.READ, Action.WRITE],
        Resource.USER: [Action.READ, Action.WRITE],
        Resource.CALL: [Action.READ, Action.WRITE],
        Resource.LEAD: [Action.READ, Action.WRITE],
        Resource.METRIC: [Action.READ, Action.WRITE],
        Resource.PROMPT: [Action.READ],
    },
}


class PromptType(str, Enum):
    CONVERSATION = "conversation"


class EventType(str, Enum):
    LEAD_CREATED = "lead_created"
    LEAD_STATUS_UPDATED = "lead_status_updated"
    LEAD_TYPE_UPDATED = "lead_type_updated"
    CALL_STARTED = "call_started"
    CALL_ENDED = "call_ended"


class CallType(str, Enum):
    APPOINTMENT_CALL = "appointment_call"
    MEETING_CALL = "meeting_call"


class LeadType(str, Enum):
    SUSPECT = "suspect"
    PROSPECT = "prospect"


class LeadStatus(str, Enum):
    YET_TO_CONTACT = "Yet to Contact"
    CONTACT_DROPPED = "Contacted & Dropped"
    FIRST_MEETING_SCHEDULED = "1st Meeting Scheduled"
    FIRST_MEETING_COMPLETED = "1st Meeting Completed"
    SECOND_MEETING_SCHEDULED = "2nd Meeting Scheduled"
    CALL_CLOSED = "Call Closed"


class ObjectType(str, Enum):
    ORGANIZATION = "organization"
    USER = "user"
    BRANCH = "branch"
    ROLE = "role"
    PERMISSION = "permission"
    ATTRIBUTE = "attribute"
    PROFILE = "profile"
    LEAD = "lead"
    PROFILE_SNAPSHOT = "profile_snapshot"
    EVENT = "event"
    CALL = "call"
    METRIC = "metric"
    DOCUMENT = "document"
    RECORDING = "recording"
    PROFILE_ATTRIBUTE_MAPPING = "pamap"
    ROLE_PERMISSION_MAPPING = "rpmap"
    USER_BRANCH_MAPPING = "ubmap"
    USER_ROLE_MAPPING = "urmap"
    PROMPT = "prompt"
    AGENT = "agent"
    INVITE = "invite"


class InviteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


def get_object_abbreviation(obj: ObjectType) -> str:
    """
    Returns the abbreviation for the given object type. Used for public IDs.

    Args:
        obj (ObjectType): The object type.

    Returns:
        str: The abbreviation for the object type.

    Raises:
        ValueError: If the object type is unknown.
    """
    if obj == ObjectType.ORGANIZATION:
        return "org"
    elif obj == ObjectType.USER:
        return "usr"
    elif obj == ObjectType.BRANCH:
        return "br"
    elif obj == ObjectType.ROLE:
        return "rol"
    elif obj == ObjectType.PERMISSION:
        return "perm"
    elif obj == ObjectType.ATTRIBUTE:
        return "attr"
    elif obj == ObjectType.PROFILE:
        return "prof"
    elif obj == ObjectType.LEAD:
        return "lead"
    elif obj == ObjectType.PROFILE_SNAPSHOT:
        return "snap"
    elif obj == ObjectType.EVENT:
        return "evnt"
    elif obj == ObjectType.CALL:
        return "call"
    elif obj == ObjectType.METRIC:
        return "metr"
    elif obj == ObjectType.DOCUMENT:
        return "doc"
    elif obj == ObjectType.RECORDING:
        return "rec"
    elif obj == ObjectType.PROFILE_ATTRIBUTE_MAPPING:
        return "pamap"
    elif obj == ObjectType.ROLE_PERMISSION_MAPPING:
        return "rpmap"
    elif obj == ObjectType.USER_BRANCH_MAPPING:
        return "ubmap"
    elif obj == ObjectType.USER_ROLE_MAPPING:
        return "urmap"
    elif obj == ObjectType.PROMPT:
        return "prompt"
    elif obj == ObjectType.AGENT:
        return "agent"
    elif obj == ObjectType.INVITE:
        return "inv"
    else:
        raise ValueError(f"Unknown object type: {obj}")


def get_id(obj: ObjectType) -> str:
    """
    Generate a ID for the given object.

    Args:
        obj (ObjectType): The object for which the ID is generated.

    Returns:
        str: The generated publication ID.

    """
    abbrv = get_object_abbreviation(obj)
    id = generate("0123456789abcdefghijklmnopqrstuvwxyz")
    return f"{abbrv}_{id}"


# Organization: Represents the organization that the application is serving.
class Organization(SQLModel, table=True):
    __tablename__ = "organizations"

    id: str = Field(primary_key=True)
    object: str = Field(default=ObjectType.ORGANIZATION)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    name: str = Field(default=None, nullable=False)


# Branch: Represents the different branches (or teams) within the organization.
class Branch(SQLModel, table=True):
    __tablename__ = "branches"

    id: str = Field(primary_key=True)
    object: str = Field(default=ObjectType.BRANCH)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    name: str = Field(default=None)
    organization_id: str = Field(foreign_key="organizations.id")


# User: Represents the users of the application, with the ability to have multiple roles.
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    object: str = Field(default=ObjectType.USER)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    email: str = Field(nullable=False)
    hashed_password: str = Field()
    full_name: str = Field()
    designation: str | None = Field(default=None)
    organization_id: str = Field(foreign_key="organizations.id")
    current_branch_id: str | None = Field(
        default=None, foreign_key="branches.id", nullable=True
    )  # Current branch the user is scoped to
    role: Role = Field(nullable=False)
    is_active: bool = Field(default=True)


# User-Branch Mapping
class UserBranchMapping(SQLModel, table=True):
    __tablename__ = "user_branch_mappings"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.USER_BRANCH_MAPPING)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    user_id: str = Field(
        foreign_key="users.id",
    )
    branch_id: str = Field(
        foreign_key="branches.id",
    )


# Attribute: Represents the different attributes that can be associated with a profile (these are dynamic properties that can be added to a profile).
class Attribute(SQLModel, table=True):
    __tablename__ = "attributes"

    id: str = Field(primary_key=True)
    object: str = Field(default=ObjectType.ATTRIBUTE)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    attribute_data: str = Field(
        default=None
    )  # This will be a JSON string containing the type of field: 'textfield', 'dropdown', 'yes/no', 'yes/no with text'
    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    branch_id: str = Field(
        foreign_key="branches.id",
    )


# Profile: Represents the profile information of a lead or prospect.
class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    id: str = Field(primary_key=True)
    object: str = Field(default=ObjectType.PROFILE)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    branch_id: str = Field(
        foreign_key="branches.id",
    )
    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    lead_id: str = Field(
        foreign_key="leads.id",
    )
    lead: "Lead" = Relationship(back_populates="profile")
    attributes: list["ProfileAttributeMapping"] = Relationship(back_populates="profile")
    # Basic Details
    full_name: str | None = Field(default=None)
    contact_number: str | None = Field(default=None)
    email: str | None = Field(default=None)
    physical_address: str | None = Field(default=None)
    city: str | None = Field(default=None)
    state: str | None = Field(default=None)
    country: str | None = Field(default=None)
    designation: str | None = Field(default=None)
    zipcode: str | None = Field(default=None)
    age: str | None = Field(default=None)  # This is a range (eg. 18-23)
    occupation: str | None = Field(default=None)
    gender: str | None = Field(default=None)
    marital_status: str | None = Field(default=None)
    # Financial Details
    dependents: int | None = Field(default=None)
    city_tier: str | None = Field(default=None)
    earning_members: int | None = Field(default=None)
    income_range: str | None = Field(default=None)
    savings: float | None = Field(default=None)
    existing_insurance_coverage: str | None = Field(default=None)
    desired_insurance_coverage: str | None = Field(default=None)
    car_loan: bool | None = Field(default=None)
    home_loan: bool | None = Field(default=None)
    other_loan: bool | None = Field(default=None)
    # Other Details
    health_status: str | None = Field(default=None)
    budget_conscious: str | None = Field(default=None)
    trust_level: str | None = Field(default=None)
    decision_making_style: str | None = Field(default=None)
    financial_literacy: str | None = Field(default=None)
    likes: str | None = Field(default=None)
    dislikes: str | None = Field(default=None)
    concerns_and_priorities: str | None = Field(default=None)


# Profile Attribute Mapping: Maps a profile to the dynamic attributes.
class ProfileAttributeMapping(SQLModel, table=True):
    __tablename__ = "profile_attribute_mappings"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.PROFILE_ATTRIBUTE_MAPPING)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    profile_id: str = Field(
        foreign_key="profiles.id",
    )
    attribute_id: str = Field(foreign_key="attributes.id")
    value: str = Field(default=None)
    profile: Profile = Relationship(back_populates="attributes")


# Lead: Represents the details of a lead, can be prospect or suspect.
class Lead(SQLModel, table=True):
    __tablename__ = "leads"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.LEAD)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    branch_id: str = Field(
        foreign_key="branches.id",
    )
    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    type: LeadType = Field(default=LeadType.SUSPECT)
    status: LeadStatus = Field(default=LeadStatus.YET_TO_CONTACT)
    associated_agent: str | None = Field(default=None)
    known_to_agent: str | None = Field(default=None)
    meeting_date: datetime | None = Field(default=None)
    profile: Profile = Relationship(back_populates="lead")
    created_by_id: str = Field(default=None)
    created_by_name: str = Field(default=None)


# Profile Snapshots: Represents the snapshots of profile data. Keeps a record of the last state of the profile before it was updated.
class ProfileSnapshot(SQLModel, table=True):
    __tablename__ = "profile_snapshots"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.PROFILE_SNAPSHOT)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    lead_id: str = Field(foreign_key="leads.id")
    version: int = Field(
        default=None,
        sa_column=Column(Integer, autoincrement=True),
    )
    data: str = Field(
        default=None, sa_column=Column(JSON, nullable=False)
    )  # JSON serialized profile data
    branch_id: str = Field(foreign_key="branches.id")
    organization_id: str = Field(
        foreign_key="organizations.id",
    )


# Events: Represents the events that occur within the organization
class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.EVENT)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    name: str = Field(default=None)
    data: dict = Field(
        default=None, sa_column=Column(JSONB, nullable=False)
    )  # JSON serialized data about the event
    branch_id: str = Field(foreign_key="branches.id")
    organization_id: str = Field(
        foreign_key="organizations.id",
    )


# Call: Represents the history of calls made for a lead.
class Call(SQLModel, table=True):
    __tablename__ = "calls"

    id: str = Field(primary_key=True)
    object: str = Field(default=ObjectType.CALL)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    # Whoever initiated the call
    user_id: str = Field(
        foreign_key="users.id",
    )
    caller_name: str = Field(default="")
    lead_id: str = Field(
        foreign_key="leads.id",
    )
    # Snapshot of the lead profile before the call
    profile_snapshot_id: str = Field(
        foreign_key="profile_snapshots.id",
    )
    branch_id: str = Field(
        foreign_key="branches.id",
    )
    prompt_id: str | None = Field(
        default=None,
        foreign_key="prompts.id",
        nullable=True,
    )
    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    call_timestamp: datetime = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            default=datetime.now(tz=timezone.utc),
        ),
    )
    agent_id: str = Field(
        foreign_key="agents.id",
    )
    call_metadata: str | None = Field(
        default=None, sa_column=Column(JSON, nullable=False)
    )  # JSON serialized profile data
    transcript: str | None = Field(default=None, nullable=True)
    report: str | None = Field(
        default=None, sa_column=Column(JSON, nullable=True)
    )  # JSON serialized report genearted by LLM
    analytics: str | None = Field(
        default=None, sa_column=Column(JSON, nullable=True)
    )  # JSON serialized analytics data from Cognicue
    type: CallType = Field(default=CallType.APPOINTMENT_CALL, nullable=True)


# Prompts: Represents user defined prompts that can be used when initiating a call with a lead.
class Prompt(SQLModel, table=True):
    __tablename__ = "prompts"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.PROMPT)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    name: str = Field(nullable=False)
    text: str = Field(sa_column=Column(Text, nullable=False))
    created_by: str = Field(
        foreign_key="users.id",
    )
    created_by_name: str = Field(default=None)
    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    branch_id: str = Field(
        foreign_key="branches.id",
    )
    known_to_agent: str | None = Field(default=None)
    meeting_status: LeadStatus | None = Field(default=LeadStatus.YET_TO_CONTACT)
    prompt_type: PromptType = Field(default=PromptType.CONVERSATION)
    report_prompt_text: str | None = Field(default=None)
    description: str = Field(default="")


# Agents: Represents the AI agent config for a lead.
class Agent(SQLModel, table=True):
    __tablename__ = "agents"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.AGENT)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    # See: https://docs.retellai.com/api-references/get-agent
    retell_llm_id: str = Field(nullable=False)
    retell_agent_id: str = Field(nullable=False)
    lead_id: str = Field(
        foreign_key="leads.id",
    )
    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    branch_id: str = Field(
        foreign_key="branches.id",
    )


class Invite(SQLModel, table=True):
    __tablename__ = "invites"

    id: str = Field(
        primary_key=True,
    )
    object: str = Field(default=ObjectType.INVITE)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    organization_id: str = Field(
        foreign_key="organizations.id",
    )
    branch_id: str = Field(
        foreign_key="branches.id",
    )
    email: str = Field()
    status: InviteStatus = Field(default=InviteStatus.PENDING)
    invited_by: str = Field(nullable=False)
    role: Role = Field(nullable=False)
    token: str = Field(unique=True)
    name: str = Field(default="")
    organization_name: str = Field(default="")


#####################  Internal Pydantic models ######################


class UserRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: SecretStr = Field(..., min_length=8)
    organization_name: str | None = None
    invite_token: str | None = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: SecretStr


class CreateOrganizationRequest(BaseModel):
    name: str


class CreateBranchRequest(BaseModel):
    name: str


class CreateLeadRequest(BaseModel):
    branch_id: str
    type: LeadType
    profile: dict = {
        "full_name": str | None,
        "contact_number": str | None,
        "email": str | None,
        "physical_address": str | None,
        "city": str | None,
        "state": str | None,
        "country": str | None,
        "designation": str | None,
        "zipcode": str | None,
        "age": str | None,
        "occupation": str | None,
        "gender": str | None,
        "marital_status": str | None,
        "dependents": int | None,
        "city_tier": str | None,
        "earning_members": int | None,
        "income_range": str | None,
        "savings": float | None,
        "existing_insurance_coverage": str | None,
        "desired_insurance_coverage": str | None,
        "car_loan": bool | None,
        "home_loan": bool | None,
        "other_loan": bool | None,
        "health_status": str | None,
        "budget_conscious": str | None,
        "trust_level": str | None,
        "decision_making_style": str | None,
        "financial_literacy": str | None,
        "likes": str | None,
        "dislikes": str | None,
        "concerns_and_priorities": str | None,
    }


class BaseLead(BaseModel):
    pub_id: str
    object: str
    name: str
    created_at: datetime
    updated_at: datetime
    branch_pub_id: str
    organization_pub_id: str
    type: LeadType
    status: LeadStatus
    associated_agent: str | None
    known_to_agent: str | None
    meeting_date: datetime | None


class BaseProfile(BaseModel):
    pub_id: str
    object: str
    created_at: datetime
    updated_at: datetime
    branch_pub_id: str
    organization_pub_id: str
    lead_pub_id: str
    full_name: str | None
    contact_number: str | None
    email: str | None
    physical_address: str | None
    city: str | None
    state: str | None
    country: str | None
    zipcode: str | None
    age: str | None
    occupation: str | None
    gender: str | None
    income_range: str | None


class LeadResponse(BaseModel):
    lead: Lead
    profile: Profile


class UpdateLeadRequest(BaseModel):
    lead: Lead | None = None
    profile: Profile | None = None


class CreatePromptRequest(BaseModel):
    name: str
    text: str
    description: str
    branch_id: str
    known_to_agent: str | None = None  # Referral type
    meeting_status: LeadStatus | None = None
    prompt_type: PromptType = PromptType.CONVERSATION
    report_prompt_text: str


class UpdatePromptRequest(BaseModel):
    name: str | None = None
    text: str | None = None
    description: str | None = None
    known_to_agent: str | None = None
    meeting_status: LeadStatus | None = None
    report_prompt_text: str | None = None


# JSON payload containing access token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None


class DeleteResponse(BaseModel):
    id: str
    deleted: bool


class CreateCallRequest(BaseModel):
    lead_id: str
    prompt_id: str
    call_type: CallType


class CallResponse(BaseModel):
    call: Call
    profile_snapshot: ProfileSnapshot


class CreateBranchInviteRequest(BaseModel):
    email: str
    name: str


class UserResponse(
    BaseModel,
):
    id: str
    object: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    email: str
    full_name: str
    designation: str | None
    organization_id: str
    current_branch_id: str | None
    role: Role
    is_active: bool


class ModifyMemberAccessRequest(BaseModel):
    is_active: bool


#####################  Instructor models ######################


class RatingScale(str, Enum):
    """Represents the rating scale for a metric."""

    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    BAD = "bad"


# class Improvement(BaseModel):
#     """Represents an improvement that can be made to a call process."""

#     area: str = Field(
#         ...,
#         description="The area of the call process related to the improvement.",
#     )
#     feedback: str = Field(
#         ..., description="Feedback to enhance the specified area of the call process."
#     )


# class CallProcessSteps(BaseModel):
#     """Represents the steps in a call process."""

#     introduction: RatingScale = Field(
#         ..., description="Rating of the agent's introduction."
#     )
#     confirm_availability: RatingScale = Field(
#         ...,
#         description="Rating of the agent's ability to confirm availability without sounding like a salesperson.",
#     )
#     purpose_of_call: RatingScale = Field(
#         ...,
#         description="Rating of the agent's statement regarding the purpose of the call.",
#     )
#     soft_takeaway: RatingScale = Field(
#         ...,
#         description="Rating of the agent's soft takeaway or disqualifying statement.",
#     )
#     qualifying_statement: RatingScale = Field(
#         ..., description="Rating of the agent's qualifying statement."
#     )
#     common_pain_examples: RatingScale = Field(
#         ...,
#         description="Rating of the agent's ability to provide common pain examples mentioned in the call.",
#     )
#     building_interest: RatingScale = Field(
#         ...,
#         description="Rating of the agent's ability to build interest in the product and mention previous successful sales.",
#     )
#     objection_handling: RatingScale = Field(
#         ..., description="Rating of the agent's ability to handle objections."
#     )
#     closing: RatingScale = Field(
#         ...,
#         description="Rating of the agent's ability to effectively close the call and schedule an appointment.",
#     )
#     improvements: list[Improvement] | None = Field(
#         ...,
#         description="List of suggested improvements for the call process. Always generate.",
#     )


# class SalesResistanceBehaviour(BaseModel):
#     """Represents the sales resistance behavior of an agent."""

#     statement_usage: RatingScale = Field(
#         ..., description="Rating of the agent's word usage and statements."
#     )
#     behaviour: RatingScale = Field(
#         ...,
#         description="Rating of the agent's behavior, including aspects like excitement, aggressiveness, and anxiety.",
#     )
#     language_usage: RatingScale = Field(
#         ...,
#         description="Rating of the agent's use of tone, pauses, and speed in communication.",
#     )
#     narcissism: RatingScale = Field(
#         ...,
#         description="Rating of the agent's focus, specifically whether they centered more on themselves than on the lead or product.",
#     )
#     focus: RatingScale = Field(
#         ...,
#         description="Rating of the agent's focus, whether it was on setting appointments or building a relationship with the lead.",
#     )
#     pitch: RatingScale = Field(
#         ...,
#         description="Rating of the agent's pitch, assessing whether it sounded sales-oriented or genuinely helpful.",
#     )
#     improvements: list[Improvement] | None = Field(
#         ...,
#         description="List of suggested improvements for the sales resistance behavior. Always generate.",
#     )


# class CallCloseAnalysis(BaseModel):
#     """Represents the analysis of the call close process."""

#     behaviour: RatingScale = Field(
#         ...,
#         description="Rating of the agent's behavior during the call close, including factors like composure and acceptance of the lead's decision.",
#     )
#     staying_in_touch: RatingScale = Field(
#         ...,
#         description="Rating of the agent's efforts to stay in touch with the lead after the call close, indicating interest in continuing the relationship.",
#     )
#     objection_handling: RatingScale = Field(
#         ...,
#         description="Rating of the agent's ability to handle objections during the call close.",
#     )
#     improvements: list[Improvement] | None = Field(
#         ...,
#         description="List of suggested improvements for the call close analysis. Always generate.",
#     )


class CallFeedback(BaseModel):
    """Represents the feedback on the call process."""

    positives: list[str] = Field(
        ...,
        description="What went well during the call. List as many as you can and be specific.",
    )
    improvements: list[str] = Field(
        ...,
        description="What could have been better during the call. List as many as you can and be specific.",
    )
    general_comments: list[str] = Field(
        ..., description="General comments on the call."
    )


class OverallCallMetrics(BaseModel):
    """Represents the overall call metrics for a lead."""

    performance: RatingScale = Field(
        ...,
        description="Rating of the agent's performance during the call, including factors like the quality of the call, the lead's satisfaction, and the agent's communication skills.",
    )
    professionalism: RatingScale = Field(
        ...,
        description="Rating of the agent's professionalism, including factors like the agent's demeanor, the lead's trust in the agent, and the agent's ability to maintain a positive attitude.",
    )
    confidence: RatingScale = Field(
        ...,
        description="Rating of the agent's confidence in the lead's decision, including factors like the lead's trust in the agent, the agent's ability to provide accurate information, and the lead's willingness to take action.",
    )
    energy_level: RatingScale = Field(
        ...,
        description="Rating of the agent's energy level during the call, including factors like the agent's enthusiasm, the lead's willingness to engage with the agent, and the agent's ability to maintain a positive attitude.",
    )
    clarity: RatingScale = Field(
        ...,
        description="Rating of the agent's clarity during the call, including factors like the agent's ability to clearly articulate their thoughts and ideas, the lead's ability to understand their perspective, and the agent's ability to provide clear and concise answers.",
    )


class AudioAnalytics(BaseModel):
    communication: str = Field(
        ..., description="Quality of communication during the call."
    )
    rate_of_speech: str = Field(..., description="Rate of speech during the call.")
    articulation_rate: str = Field(
        ..., description="Articulation rate during the call."
    )
    number_of_pauses: str = Field(..., description="Number of pauses during the call.")
    response_latency: str = Field(..., description="Response latency during the call.")


class VideoAnalytics(BaseModel):
    attention: str = Field(..., description="Level of attention during the call.")
    engagement: str = Field(..., description="Level of engagement during the call.")
    expressiveness: str = Field(
        ..., description="Level of expressiveness during the call."
    )
    confidence: str = Field(..., description="Level of confidence during the call.")
    positive_emotions: str = Field(
        ..., description="Level of positive emotions during the call."
    )
    negative_emotions: str = Field(
        ..., description="Level of negative emotions during the call."
    )
    positive_facial_expressions: str = Field(
        ..., description="Frequency of positive facial expressions."
    )
    negative_facial_expressions: str = Field(
        ..., description="Frequency of negative facial expressions."
    )


class CallReport(BaseModel):
    """Represents a report of a call between an insurance agent and a lead."""

    overall_call_metrics: OverallCallMetrics = Field(
        ..., description="Overall call metrics for the lead."
    )
    call_feedback: CallFeedback = Field(
        ..., description="Feedback on the call process."
    )
    audio_analytics: AudioAnalytics = Field(
        ..., description="Analytics related to audio during the call."
    )
    video_analytics: VideoAnalytics = Field(
        ..., description="Analytics related to video during the call."
    )


class AudioAnalytics(BaseModel):
    communication: float = 0.0
    rate_of_speech: float = 0.0
    articulation_rate: float = 0.0
    number_of_pauses: float = 0.0
    speaking_duration: float = 0.0
    original_duration: float = 0.0
    response_latency: float = 0.0


class VideoAnalytics(BaseModel):
    attention: float = 0.0
    engagement: float = 0.0
    expressiveness: float = 0.0
    confidence: float = 0.0
    confusion: float = 0.0
    nervousness: float = 0.0
    positive_emotions: float = 0.0
    negative_emotions: float = 0.0
    positive_facial_expressions: float = 0.0
    negative_facial_expressions: float = 0.0


class AnalyticsData(BaseModel):
    audio_analytics: AudioAnalytics = Field(default_factory=AudioAnalytics)
    video_analytics: VideoAnalytics = Field(default_factory=VideoAnalytics)


class AudioAnalyticsLabel(BaseModel):
    communication: str = "Poor"
    rate_of_speech: str = "Poor"
    articulation_rate: str = "Poor"
    number_of_pauses: str = "High"
    response_latency: str = "Poor"


class VideoAnalyticsLabel(BaseModel):
    attention: str = "Poor"
    engagement: str = "Poor"
    expressiveness: str = "Poor"
    confidence: str = "Poor"
    positive_emotions: str = "Low"
    negative_emotions: str = "High"
    positive_facial_expressions: str = "Low"
    negative_facial_expressions: str = "High"


class AnalyticsLabel(BaseModel):
    audio_analytics: AudioAnalyticsLabel = Field(default_factory=AudioAnalyticsLabel)
    video_analytics: VideoAnalyticsLabel = Field(default_factory=VideoAnalyticsLabel)


class InterviewData(BaseModel):
    candidate_interview_id: str = ""
    interview_status: str = ""
    interview_name: str = ""
    interview_id: str = ""
    interview_url: str = ""
    analytics_url: str = ""
    analytics_pdf: str = ""
    analytics_data: AnalyticsData = Field(default_factory=AnalyticsData)
    analytics_label: AnalyticsLabel = Field(default_factory=AnalyticsLabel)
    activate_date: datetime = Field(default_factory=datetime.now)
    deactivate_date: datetime | None = None
    interview_score: float = 0.0
