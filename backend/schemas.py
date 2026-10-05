from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


Status = Literal["New", "Contacted", "Follow-up Due", "Converted", "Closed"]


class LeadBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    company: str = Field(min_length=2, max_length=160)
    email: EmailStr
    event: str = Field(min_length=2, max_length=160)
    notes: str = Field(default="", max_length=5000)
    follow_up_status: Status = "New"


class LeadCreate(LeadBase):
    pass


class LeadUpdate(LeadBase):
    pass


class LeadRead(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class Stats(BaseModel):
    total: int
    new: int
    contacted: int
    follow_up_due: int
    converted: int
    closed: int


class AIResponse(BaseModel):
    lead_id: int
    action: Literal["summary", "follow_up"]
    result: str
