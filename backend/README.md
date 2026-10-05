# Backend — AI Event Lead Manager

FastAPI + SQLAlchemy + PostgreSQL/SQLite + OpenAI.

## Local setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env  # Windows
# cp .env.example .env # macOS/Linux
uvicorn main:app --reload
```

API docs: http://127.0.0.1:8000/docs

To add sample data:

```bash
python seed.py
```

For PostgreSQL, replace `DATABASE_URL` with your PostgreSQL connection string. The application automatically normalizes `postgresql://` URLs to use psycopg.
