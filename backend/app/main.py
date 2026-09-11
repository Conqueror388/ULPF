from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.storage.database import init_db, SessionLocal
from backend.app.storage.seed_data import seed_database
from backend.app.api import (
    dashboard_router,
    sources_router,
    parsers_router,
    logs_router,
    stream_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed Sample Data
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="ULPF — Universal Log Pre-processing Framework",
    description="Unified Log Ingestion, Auto Format Detection, OCSF Normalization & Cryptographic Integrity Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(dashboard_router)
app.include_router(sources_router)
app.include_router(parsers_router)
app.include_router(logs_router)
app.include_router(stream_router)

@app.get("/")
def root():
    return {
        "framework": "ULPF — Universal Log Pre-processing Framework",
        "version": "1.0.0",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
