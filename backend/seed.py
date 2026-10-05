from database import Base, SessionLocal, engine
from models import Lead

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    if db.query(Lead).count() == 0:
        db.add_all([
            Lead(name="Priya Shah", company="Northstar Labs", email="priya@northstarlabs.example", event="SaaS Growth Summit", notes="Interested in improving event lead follow-up. Asked about automated summaries and next-step emails.", follow_up_status="Follow-up Due"),
            Lead(name="Arjun Mehta", company="Orbit Systems", email="arjun@orbitsystems.example", event="B2B Connect 2026", notes="Met at the product analytics booth. Wants a short product walkthrough for his sales operations team.", follow_up_status="Contacted"),
            Lead(name="Maya Rao", company="BrightPath", email="maya@brightpath.example", event="B2B Connect 2026", notes="Discussed measuring event ROI. Requested a follow-up with examples.", follow_up_status="New"),
        ])
        db.commit()
        print("Seeded sample leads.")
    else:
        print("Database already contains leads; nothing changed.")
finally:
    db.close()
