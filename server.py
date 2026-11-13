from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import random
from generate_who_certificate import build_who_certificate_pdf

app = FastAPI(
    title="VaxGuard WHO Cold-Chain Compliance PDF API",
    version="1.0.0",
    description="Generates official WHO PQS E006 / 21 CFR Part 11 compliant 1-page PDF audit certificates."
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CertificatePayload(BaseModel):
    cert_id: Optional[str] = None
    node_id: Optional[str] = "VAX-NODE-01"
    rtc_timestamp: Optional[str] = None
    rtc_date_short: Optional[str] = None
    blocks: List[Dict[str, Any]] = []
    is_chain_intact: bool = True
    potency_pct: float = 100.0
    remaining_hours: float = 720.0
    mkt_temp: float = 4.25
    batt_v: float = 3.01
    projected_days: int = 184
    enclosure_status: str = "SEALED"

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VaxGuard WHO Certificate Generator",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/generate-who-pdf")
def generate_who_pdf(payload: CertificatePayload):
    try:
        data = payload.model_dump()
        
        # Populate defaults if missing
        if not data.get("cert_id"):
            data["cert_id"] = f"WHO-VAX-2026-{random.randint(0x1000, 0xFFFF):04X}"
            
        now_utc = datetime.now(timezone.utc)
        if not data.get("rtc_timestamp"):
            data["rtc_timestamp"] = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")
        if not data.get("rtc_date_short"):
            data["rtc_date_short"] = now_utc.strftime("%d %b %Y").upper()
            
        pdf_bytes = build_who_certificate_pdf(data)
        
        node_id = data.get("node_id", "VAX-NODE-01")
        filename = f"WHO_ColdChain_Certificate_{node_id}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate certificate: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
