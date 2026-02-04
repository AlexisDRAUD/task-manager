from pydantic import BaseModel, Field
from datetime import datetime


class TaskCreate(BaseModel):
    """Modèle de création de Tâche"""
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)


class TaskUpdate(BaseModel):
    """Modèle de modification de Tâche"""
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    status: str | None = Field(default=None, pattern="^(TODO|DOING|DONE)$")


class TaskOut(BaseModel):
    """Modèle de Tâche API"""
    id: int
    title: str
    description: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config(object):
        """Config"""
        from_attributes = True
