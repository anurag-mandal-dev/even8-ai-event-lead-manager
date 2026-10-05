# EventFlow — AI Event Lead Manager

A complete full-stack implementation of the Even8 **AI Native Full Stack Intern** technical assignment.

## Assignment coverage

- Add, edit and delete event leads
- Search and filter leads
- Store name, company, email, event, notes and follow-up status
- Persistent SQL database: SQLite locally, PostgreSQL in deployment
- AI interaction-note summaries
- AI follow-up message drafts
- Responsive UI
- REST API with FastAPI
- Public GitHub + live deployment ready
- README and API documentation via FastAPI Swagger

The assignment asks for a public GitHub repository, a live deployed application link, and a short README. A demo video is optional.

## Architecture

```text
Next.js 16 frontend (Vercel)
          |
          | HTTPS REST / JSON
          v
FastAPI backend (Render)
          |
          +------ SQLAlchemy ------ PostgreSQL (Supabase)
          |
          +------ OpenAI Responses API ------ GPT model
```

## Project structure

```text
even8-ai-event-lead-manager/
├── backend/
│   ├── ai.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AIModal.tsx
│   │   ├── LeadCard.tsx
│   │   └── LeadForm.tsx
│   ├── lib/api.ts
│   ├── package.json
│   ├── next.config.ts
│   └── .env.example
├── docs/DATABASE.sql
├── render.yaml
└── README.md
```

## 1. Prerequisites

- Node.js 20.9+
- Python 3.11+
- Git
- A GitHub account
- A PostgreSQL provider account for production (Supabase is one option)
- Google Gemini API key for AI features

Next.js currently requires Node.js 20.9 or newer according to the official installation guide.

## 2. Run backend locally

Open Terminal 1:

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Create `.env` from `.env.example` and set:

```env
DATABASE_URL=sqlite:///./leads.db
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
```

Start the API:

```bash
uvicorn main:app --reload
```

Open:

- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs

Optional sample data:

```bash
python seed.py
```

## 3. Run frontend locally

Open Terminal 2:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start:

```bash
npm run dev
```

Open http://localhost:3000.

## 4. Test the assignment requirements

1. Add a lead.
2. Confirm it appears in the pipeline.
3. Search by name/company/event/notes.
4. Filter by status and event.
5. Edit the lead.
6. Delete the lead.
7. Click **Summarize**.
8. Click **Draft follow-up**.
9. Open the API docs at `/docs` and demonstrate the REST endpoints.
10. Run `npm run build` before pushing.

## 5. Production database with Supabase

Create a PostgreSQL database in Supabase and use the project's **Connect** dialog to obtain the PostgreSQL connection string. Put that string into Render as `DATABASE_URL`.

The backend supports PostgreSQL through psycopg. Never put the database password in the frontend or in GitHub.

## 6. Deploy backend to Render

Push this repository to GitHub.

In Render:

1. New → Web Service.
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend` if you are configuring manually.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` = your PostgreSQL URL
   - `FRONTEND_URL` = your final Vercel URL
   - `GEMINI_API_KEY`=your_gemini_api_key
   - `GEMINI_MODE`L=gemini-3.5-flash-lite
7. Deploy.

After deployment, test:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/health
https://YOUR-RENDER-SERVICE.onrender.com/docs
```

## 7. Deploy frontend to Vercel

Import the same GitHub repository into Vercel.

Because the frontend is in a subdirectory, set the project's **Root Directory** to `frontend`.

Add:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Deploy.

Then return to Render and update:

```env
FRONTEND_URL=https://YOUR-VERCEL-APP.vercel.app
```

Redeploy the backend if required.

## 8. GitHub submission

Before sending the application:

```bash
git init
git add .
git commit -m "Build AI Event Lead Manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/even8-ai-event-lead-manager.git
git push -u origin main
```

Do **not** commit `.env`, API keys, database passwords, `node_modules`, `.venv`, or local database files.

## 9. Email submission

The assignment document specifies:

- To: careers@even8.io
- Subject: `Full Stack Assignment Your Name`
- Resume: not required
- Include the GitHub repository and live deployed application link.

Suggested email:

```text
Subject: Full Stack Assignment Anurag Mandal

Hello Even8 team,

I have completed the AI Event Lead Manager assignment for the AI Native Full Stack Intern role.

GitHub: <your-public-github-url>
Live app: <your-vercel-url>

The application includes lead CRUD, search/filtering, PostgreSQL persistence, FastAPI REST APIs, and AI-powered note summaries and follow-up drafts.

Thank you for reviewing my submission.

Regards,
Anurag Mandal
```

## Technical decisions to explain in an interview

### Why FastAPI?
It provides typed request validation, automatic OpenAPI/Swagger documentation, and a lightweight Python backend suitable for this assignment.

### Why PostgreSQL?
The data is structured and relational, and PostgreSQL is a strong production database choice for a lead-management system.

### Why keep AI behind FastAPI?
The Gemini API key remains server-side and is never exposed in browser JavaScript. The frontend only communicates with the backend AI endpoints.

### Why separate AI endpoints?
The Gemini API key remains server-side and is never exposed in browser JavaScript. The frontend only communicates with the backend AI endpoints.

### Assignment Submission
GitHub Repository:
https://github.com/anurag-mandal-dev/even8-ai-event-lead-manager
Live Application:
https://even8-ai-event-lead-manager.vercel.app
Backend API:
https://even8-ai-event-lead-manager.onrender.com
API Documentation:
https://even8-ai-event-lead-manager.onrender.com/docs