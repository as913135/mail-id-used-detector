import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import init_db
from backend.routers.auth_routes import router as auth_router
from backend.routers.identifier_routes import router as identifier_router
from backend.routers.scan_routes import router as scan_router
from backend.routers.consent_routes import router as consent_router
from backend.routers.removal_routes import router as removal_router
from backend.routers.stats_routes import router as stats_router

app = FastAPI(
    title="PrivaScan API",
    description="Privacy-Focused Personal Data Exposure Scanner & Removal Management Platform",
    version="1.0.0"
)

# Enable CORS for local dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router)
app.include_router(identifier_router)
app.include_router(scan_router)
app.include_router(consent_router)
app.include_router(removal_router)
app.include_router(stats_router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PrivaScan Core Engine",
        "version": "1.0.0",
        "sources_online": [
            "XposedOrNot Breach Analytics",
            "Gravatar Public Directory",
            "GitHub Public OSINT",
            "Libphonenumber Regional Telecom Registry",
            "Truecaller Unlisting Pipeline",
            "TRAI DND 1909 India Registry",
            "FTC DoNotCall US Registry",
            "Google Personal De-indexing Service",
            "Global Data Broker Opt-Out Directory"
        ]
    }

# Serve frontend build if dist directory exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
