import uuid
import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# Organisation Schema
class OrganisationBase(BaseModel):
    name: str

class OrganisationCreate(OrganisationBase):
    pass

class OrganisationResponse(OrganisationBase):
    id: uuid.UUID
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True) # Tells pydantic to read schema from SQLalchemy


# User Schema
class UserBase(BaseModel):
    email: EmailStr
    organisation_id: uuid.UUID

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)



# Inspection schemas
class InspectionBase(BaseModel):
    image_url: str
    prediction: str
    confidence: float

class InspectCreate(InspectionBase):
    pass

class InspectResponse(InspectionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    image_url: str
    prediction: str
    confidence: float
    human_corrected: bool
    corrected_label: str | None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

