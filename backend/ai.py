import os

from dotenv import load_dotenv
from google import genai

load_dotenv()
class AIServiceError(Exception):
    pass

def get_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured on the backend.")

    return genai.Client(api_key=api_key)


def generate_text(prompt: str) -> str:
    try:
        client = get_client()

        model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.5-flash-lite"
        )

        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )

        if not response.text:
            raise AIServiceError("Gemini returned an empty response.")

        return response.text.strip()

    except AIServiceError:
        raise

    except Exception as exc:
        print("GEMINI ERROR:", repr(exc))
        raise AIServiceError(str(exc)) from exc


def summarize_notes(
    name: str,
    company: str,
    event: str,
    notes: str,
) -> str:
    prompt = f"""
You are helping a B2B sales team.

Summarize the following event interaction into 3 to 5 concise
bullet points.

Focus on:
- Who the person is
- Their company or role if mentioned
- Their interests or needs
- Important context
- Recommended next step

Do not invent information.

Person: {name}
Company: {company}
Event: {event}

Interaction notes:
{notes}

Return only the summary bullets.
"""

    return generate_text(prompt)


def draft_follow_up(
    name: str,
    company: str,
    event: str,
    notes: str,
) -> str:
    prompt = f"""
Write a professional but natural follow-up email for a person met at
a business event.

Person: {name}
Company: {company}
Event: {event}

Interaction notes:
{notes}

Requirements:
- Keep it concise.
- Mention the event naturally.
- Reference the conversation.
- Suggest a sensible next step.
- Do not invent facts.
- Do not use exaggerated sales language.
- Include a subject line.
"""

    return generate_text(prompt)