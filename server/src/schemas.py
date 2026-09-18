"""Pydantic request and response schemas."""

import datetime
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr
from src.role import UserRole, UserStatus


class OrganisationBase(BaseModel):
    name: str


class OrganisationCreate(OrganisationBase):
    pass


class OrganisationResponse(OrganisationBase):
    id: uuid.UUID
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: EmailStr
    organisation_name: str
    role: UserRole

# Later created to use BaseModel for login endpoint not using application/JSON.
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PublicUserCreate(BaseModel):
    email: EmailStr
    organisation_name: str
    password: str


class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class PendingUserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class InspectionBase(BaseModel):
    image_url: str
    prediction: str
    confidence: float


class InspectCreate(InspectionBase):
    pass


class InspectResponse(InspectionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    human_corrected: bool
    corrected_label: str | None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# For Admin Organisation Informations in Dashboard
class OrgInspectionsResponse(BaseModel):
    all_user_count: list[int]
    inspections: list[InspectResponse]
    human_corrected_count: int
    pending_users: list[PendingUserResponse]

# For sign in status change.
class UserStatusUpdate(BaseModel):
    user_id: uuid.UUID
    status: UserStatus


class UserStatusUpdates(BaseModel):
    updates: list[UserStatusUpdate]


class PasswordUpdate(BaseModel):
    new_password: str
    current_password: str
