from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(
        default="success",
        description="Service health status",
        example="success",
    )
    message: str = Field(
        default="Brightloop 360 API is running",
        description="Health check status message",
        example="Brightloop 360 API is running",
    )


class RootResponse(BaseModel):
    project: str = Field(
        default="Brightloop 360",
        description="Project name",
        example="Brightloop 360",
    )
    version: str = Field(
        default="1.0.0",
        description="API version",
        example="1.0.0",
    )
    status: str = Field(
        default="online",
        description="Service status",
        example="online",
    )
    docs: str = Field(
        default="/docs",
        description="API documentation URL path",
        example="/docs",
    )
