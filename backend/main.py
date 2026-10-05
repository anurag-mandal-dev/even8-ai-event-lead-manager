import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ai import AIServiceError, draft_follow_up, summarize_notes
from database import Base, engine, get_db
from models import Lead
from schemas import AIResponse, LeadCreate, LeadRead, LeadUpdate, Stats


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AI Event Lead Manager API",
    description="REST API for the Even8 full-stack internship assignment.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [item.strip() for item in os.getenv("FRONTEND_URL", "http://localhost:3000").split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/", tags=["health"])
def root():
    return {"message": "AI Event Lead Manager API is running", "docs": "/docs"}


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}


@app.get("/api/stats", response_model=Stats, tags=["leads"])
def stats(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Lead.follow_up_status, func.count(Lead.id)).group_by(Lead.follow_up_status)
    ).all()
    counts = {status: count for status, count in rows}
    return Stats(
        total=sum(counts.values()),
        new=counts.get("New", 0),
        contacted=counts.get("Contacted", 0),
        follow_up_due=counts.get("Follow-up Due", 0),
        converted=counts.get("Converted", 0),
        closed=counts.get("Closed", 0),
    )


@app.get("/api/leads", response_model=list[LeadRead], tags=["leads"])
def list_leads(
    search: str | None = Query(default=None, max_length=100),
    status: str | None = Query(default=None, max_length=40),
    event: str | None = Query(default=None, max_length=160),
    db: Session = Depends(get_db),
):
    statement = select(Lead).order_by(Lead.created_at.desc())

    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Lead.name.ilike(term),
                Lead.company.ilike(term),
                Lead.email.ilike(term),
                Lead.event.ilike(term),
                Lead.notes.ilike(term),
            )
        )
    if status:
        statement = statement.where(Lead.follow_up_status == status)
    if event:
        statement = statement.where(Lead.event == event)

    return list(db.scalars(statement).all())


@app.post("/api/leads", response_model=LeadRead, status_code=201, tags=["leads"])
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@app.get("/api/leads/{lead_id}", response_model=LeadRead, tags=["leads"])
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@app.put("/api/leads/{lead_id}", response_model=LeadRead, tags=["leads"])
def update_lead(lead_id: int, payload: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for key, value in payload.model_dump().items():
        setattr(lead, key, value)
    db.commit()
    db.refresh(lead)
    return lead


@app.delete("/api/leads/{lead_id}", status_code=204, tags=["leads"])
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()


@app.post("/api/leads/{lead_id}/summarize", response_model=AIResponse, tags=["ai"])
def summarize_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if not lead.notes.strip():
        raise HTTPException(status_code=400, detail="Add interaction notes before using AI summary.")
    try:
        result = summarize_notes(lead.name, lead.company, lead.event, lead.notes)
    except AIServiceError as exc:
        print("SUMMARIZE ERROR:", repr(exc))
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service request failed.") from exc
    return AIResponse(lead_id=lead.id, action="summary", result=result)


@app.post("/api/leads/{lead_id}/follow-up", response_model=AIResponse, tags=["ai"])
def follow_up_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if not lead.notes.strip():
        raise HTTPException(status_code=400, detail="Add interaction notes before drafting a follow-up.")
    try:
        result = draft_follow_up(lead.name, lead.company, lead.event, lead.notes)
    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service request failed.") from exc
    return AIResponse(lead_id=lead.id, action="follow_up", result=result)
