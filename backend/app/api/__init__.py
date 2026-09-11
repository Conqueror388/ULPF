from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.sources import router as sources_router
from backend.app.api.parsers import router as parsers_router
from backend.app.api.logs import router as logs_router
from backend.app.api.stream import router as stream_router

__all__ = [
    "dashboard_router",
    "sources_router",
    "parsers_router",
    "logs_router",
    "stream_router",
]
