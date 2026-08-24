"""Pydantic request and response schemas."""

import datetime
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr


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
    organisation_id: uuid.UUID


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
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
