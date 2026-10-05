"use client";

import { useEffect, useState } from "react";
import type { Lead, LeadPayload, Status } from "@/lib/api";

const statuses: Status[] = ["New", "Contacted", "Follow-up Due", "Converted", "Closed"];

type Props = {
  lead?: Lead | null;
  onSave: (payload: LeadPayload) => Promise<void>;
  onCancel: () => void;
};

export default function LeadForm({ lead, onSave, onCancel }: Props) {
  const [form, setForm] = useState<LeadPayload>({
    name: "",
    company: "",
    email: "",
    event: "",
    notes: "",
    follow_up_status: "New",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        event: lead.event,
        notes: lead.notes,
        follow_up_status: lead.follow_up_status,
      });
    } else {
      setForm({ name: "", company: "", email: "", event: "", notes: "", follow_up_status: "New" });
    }
  }, [lead]);

  function update(field: keyof LeadPayload, value: string) {
    setForm((current) => ({ ...current, [field]: value } as LeadPayload));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-header">
        <div>
          <p className="eyebrow">{lead ? "Edit lead" : "New lead"}</p>
          <h2>{lead ? "Update lead details" : "Capture a new event lead"}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Close form">×</button>
      </div>

      <div className="form-grid">
        <label>Name<input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Alex Morgan" /></label>
        <label>Company<input required value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." /></label>
        <label>Email<input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="alex@acme.com" /></label>
        <label>Event<input required value={form.event} onChange={(e) => update("event", e.target.value)} placeholder="SaaS Growth Summit" /></label>
        <label>Status<select value={form.follow_up_status} onChange={(e) => update("follow_up_status", e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="full">Interaction notes<textarea required value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={6} placeholder="What did you discuss? What does the lead care about? What is the next step?" /></label>
      </div>

      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="button primary" type="submit" disabled={saving}>{saving ? "Saving…" : lead ? "Save changes" : "Add lead"}</button>
      </div>
    </form>
  );
}
