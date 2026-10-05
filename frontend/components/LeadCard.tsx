"use client";

import type { Lead } from "@/lib/api";

type Props = {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onAI: (lead: Lead, action: "summarize" | "follow-up") => void;
};

const statusClass: Record<Lead["follow_up_status"], string> = {
  New: "status-new",
  Contacted: "status-contacted",
  "Follow-up Due": "status-due",
  Converted: "status-converted",
  Closed: "status-closed",
};

export default function LeadCard({ lead, onEdit, onDelete, onAI }: Props) {
  return (
    <article className="lead-card">
      <div className="lead-topline">
        <div className="avatar">{lead.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div className="lead-identity">
          <h3>{lead.name}</h3>
          <p>{lead.company} · {lead.event}</p>
        </div>
        <span className={`status ${statusClass[lead.follow_up_status]}`}>{lead.follow_up_status}</span>
      </div>

      <div className="lead-meta">
        <a href={`mailto:${lead.email}`}>{lead.email}</a>
        <span>Added {new Date(lead.created_at).toLocaleDateString()}</span>
      </div>

      <p className="notes-preview">{lead.notes}</p>

      <div className="card-actions">
        <button className="button small ai" onClick={() => onAI(lead, "summarize")}>✦ Summarize</button>
        <button className="button small ai" onClick={() => onAI(lead, "follow-up")}>✉ Draft follow-up</button>
        <span className="action-spacer" />
        <button className="text-button" onClick={() => onEdit(lead)}>Edit</button>
        <button className="text-button danger" onClick={() => onDelete(lead)}>Delete</button>
      </div>
    </article>
  );
}
