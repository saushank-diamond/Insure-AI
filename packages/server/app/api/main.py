from fastapi import APIRouter

from app.api.routes import (
    authentication,
    calls,
    leads,
    metrics,
    organizations,
    prompts,
    webhooks,
)

api_router = APIRouter()
api_router.include_router(authentication.router, tags=["Authentication"])
api_router.include_router(organizations.router, tags=["Organizations"])
api_router.include_router(leads.router, tags=["Leads"])
api_router.include_router(prompts.router, tags=["Prompts"])
api_router.include_router(metrics.router, tags=["Metrics"])
api_router.include_router(calls.router, tags=["Calls"])
api_router.include_router(webhooks.router, tags=["Webhooks"])
