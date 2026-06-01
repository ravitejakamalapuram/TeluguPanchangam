"""
Minimal FastAPI placeholder. The Telugu Calendar is a fully client-side
Chrome Extension (everything runs in the new-tab page). This server exists
only to satisfy the platform supervisor and provide a health endpoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Telugu Calendar Extension - Health API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "telugu-calendar-extension"}


@app.get("/api/")
async def root():
    return {"message": "Telugu Calendar Extension - frontend is a chrome new tab page."}
