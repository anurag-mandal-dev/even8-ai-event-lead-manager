export type Status = "New" | "Contacted" | "Follow-up Due" | "Converted" | "Closed";

export type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  event: string;
  notes: string;
  follow_up_status: Status;
  created_at: string;
  updated_at: string;
};

export type LeadPayload = Omit<Pick<Lead, "name" | "company" | "email" | "event" | "notes" | "follow_up_status">, never>;

export type Stats = {
  total: number;
  new: number;
  contacted: number;
  follow_up_due: number;
  converted: number;
  closed: number;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) message = body.detail;
    } catch {
      // Keep the default message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getLeads(params: { search?: string; status?: string; event?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "All") query.set("status", params.status);
  if (params.event && params.event !== "All") query.set("event", params.event);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<Lead[]>(`/api/leads${suffix}`);
}

export function getStats() {
  return request<Stats>("/api/stats");
}

export function createLead(payload: LeadPayload) {
  return request<Lead>("/api/leads", { method: "POST", body: JSON.stringify(payload) });
}

export function updateLead(id: number, payload: LeadPayload) {
  return request<Lead>(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteLead(id: number) {
  return request<void>(`/api/leads/${id}`, { method: "DELETE" });
}

export function aiAction(id: number, action: "summarize" | "follow-up") {
  return request<{ lead_id: number; action: string; result: string }>(`/api/leads/${id}/${action}`, {
    method: "POST",
  });
}
