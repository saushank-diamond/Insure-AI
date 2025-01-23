import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.utils import custom_generate_unique_id, raise_custom_exception

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    swagger_ui_parameters={"persistAuthorization": True},
)

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)


@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    """
    Global error handler for all exceptions.
    """
    logger.error(f"An error occurred: {exc}")

    return raise_custom_exception(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="An unexpected error occurred. Please try again later.",
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return raise_custom_exception(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Invalid request data. Please check the error details for more information.",
        detail=exc.errors(),
    )


# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health", include_in_schema=False, tags=["health"])
async def health():
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.API_V1_STR)
