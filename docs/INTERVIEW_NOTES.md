# Interview explanation cheat sheet

## Request flow

Browser → Next.js → FastAPI → SQLAlchemy → PostgreSQL.

For AI:

Browser → FastAPI `/api/leads/{id}/summarize` → OpenAI Responses API → FastAPI → Browser.

## Why not call OpenAI directly from the browser?

The API key is a secret. It belongs on the backend. The frontend receives only the generated result.

## CRUD endpoints

- `POST /api/leads`
- `GET /api/leads`
- `GET /api/leads/{id}`
- `PUT /api/leads/{id}`
- `DELETE /api/leads/{id}`

## AI endpoints

- `POST /api/leads/{id}/summarize`
- `POST /api/leads/{id}/follow-up`

## Search/filter design

The GET `/api/leads` endpoint accepts `search`, `status`, and `event` query parameters. Search is applied across name, company, email, event and notes.

## Database design

A single `leads` table is enough for this assignment because the required data is a single lead record. Indexes are added to commonly filtered fields such as name, company, event and status.

## Production decision

SQLite is used for local setup because it has zero infrastructure. PostgreSQL is used for deployment because the application needs persistent relational storage.
