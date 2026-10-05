"use client";

import { useEffect, useMemo, useState } from "react";
import AIModal from "@/components/AIModal";
import LeadCard from "@/components/LeadCard";
import LeadForm from "@/components/LeadForm";
import { aiAction, createLead, deleteLead, getLeads, getStats, updateLead, type Lead, type LeadPayload, type Stats } from "@/lib/api";

const emptyStats: Stats = { total: 0, new: 0, contacted: 0, follow_up_due: 0, converted: 0, closed: 0 };

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [event, setEvent] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [ai, setAi] = useState<{ title: string; result: string } | null>(null);

  const events = useMemo(() => Array.from(new Set(leads.map((lead) => lead.event))).sort(), [leads]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [leadData, statsData] = await Promise.all([
        getLeads({ search, status, event }),
        getStats(),
      ]);
      setLeads(leadData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timer);
    // refresh intentionally tracks filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, event]);

  async function save(payload: LeadPayload) {
    try {
      if (editing) await updateLead(editing.id, payload);
      else await createLead(payload);
      setEditing(null);
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save lead.");
    }
  }

  async function remove(lead: Lead) {
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) return;
    try {
      await deleteLead(lead.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete lead.");
    }
  }

  async function runAI(lead: Lead, action: "summarize" | "follow-up") {
    setError("");
    try {
      const result = await aiAction(lead.id, action);
      setAi({
        title: action === "summarize" ? `Summary — ${lead.name}` : `Follow-up — ${lead.name}`,
        result: result.result,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    }
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setShowForm(true);
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">E</span><span>EventFlow</span></div>
        <div className="topbar-right"><span className="live-dot" /> AI Event Lead Manager <span className="separator">·</span> Even8 Assignment</div>
      </header>

      <section className="hero shell">
        <div>
          <p className="eyebrow">Event lead operations</p>
          <h1>Turn conversations into <span>next steps.</span></h1>
          <p className="hero-copy">Capture every event lead, keep follow-ups organized, and use AI to turn rough notes into useful summaries and messages.</p>
        </div>
        <button className="button primary large" onClick={openCreate}>+ Add lead</button>
      </section>

      <section className="shell stats-grid">
        <Stat label="Total leads" value={stats.total} />
        <Stat label="New" value={stats.new} />
        <Stat label="Follow-up due" value={stats.follow_up_due} emphasis />
        <Stat label="Converted" value={stats.converted} />
      </section>

      <section className="shell workspace">
        <div className="toolbar">
          <div className="search-wrap"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, company, event, notes…" /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>New</option><option>Contacted</option><option>Follow-up Due</option><option>Converted</option><option>Closed</option></select>
          <select value={event} onChange={(e) => setEvent(e.target.value)}><option>All</option>{events.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        {error && <div className="error-banner"><strong>Something went wrong.</strong> {error}<button onClick={() => setError("")}>×</button></div>}

        <div className="section-heading"><div><p className="eyebrow">Pipeline</p><h2>{loading ? "Loading…" : `${leads.length} lead${leads.length === 1 ? "" : "s"}`}</h2></div><span className="helper">AI actions use the interaction notes</span></div>

        {loading ? <div className="empty-state">Loading your pipeline…</div> : leads.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">✦</div><h3>No leads found</h3><p>Try changing your filters or add your first event lead.</p><button className="button primary" onClick={openCreate}>Add your first lead</button></div>
        ) : (
          <div className="lead-list">{leads.map((lead) => <LeadCard key={lead.id} lead={lead} onEdit={openEdit} onDelete={remove} onAI={runAI} />)}</div>
        )}
      </section>

      <footer className="footer shell"><span>EventFlow</span><span>Built for the Even8 AI Native Full Stack Intern assignment</span></footer>

      {showForm && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><LeadForm lead={editing} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }} /></div></div>}
      {ai && <AIModal title={ai.title} result={ai.result} onClose={() => setAi(null)} />}
    </main>
  );
}

function Stat({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return <div className={`stat-card ${emphasis ? "emphasis" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}
