"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Globe, ChevronDown } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  url: string | null;
  stack: string | null;
  message: string | null;
  status: "PENDING" | "REVIEWING" | "COMPLETED" | "REJECTED";
  notes: string | null;
  createdAt: string;
}

const statusConfig = {
  PENDING:   { label: "Pending",   color: "bg-amber-100 text-amber-800 border-amber-200" },
  REVIEWING: { label: "Reviewing", color: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
  REJECTED:  { label: "Rejected",  color: "bg-red-100 text-red-800 border-red-200" },
};

const statusOptions = Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig[keyof typeof statusConfig]][];

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: Contact["status"]) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  }

  async function saveNotes(id: string) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: notesDraft } : c)),
    );
    setEditingNotes(null);
  }

  const filtered =
    filter === "ALL" ? contacts : contacts.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark">Free Evaluation Requests</h1>
          <p className="mt-1 text-sm text-text-muted">{contacts.length} total</p>
        </div>
        {/* Filter */}
        <div className="flex gap-2">
          {["ALL", "PENDING", "REVIEWING", "COMPLETED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? "border-navy-dark bg-navy-dark text-white"
                  : "border-border bg-white text-text-muted hover:border-navy-dark"
              }`}
            >
              {s === "ALL" ? "All" : statusConfig[s as Contact["status"]].label}
              {s !== "ALL" && (
                <span className="ml-1.5 opacity-60">
                  {contacts.filter((c) => c.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6 py-12 text-center">
          <Mail className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <p className="text-text-muted">No requests</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy-dark">{c.name}</p>
                    {c.stack && (
                      <span className="rounded-full bg-bg-cream px-2 py-0.5 text-xs text-text-muted">
                        {c.stack}
                      </span>
                    )}
                    <span className="text-xs text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                    <a href={`mailto:${c.email}`} className="hover:text-gold transition-colors flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />{c.email}
                    </a>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />{c.url}
                      </a>
                    )}
                  </div>

                  {c.message && (
                    <p className="mt-2.5 rounded-lg bg-bg-cream px-3 py-2 text-sm text-text-body">
                      {c.message}
                    </p>
                  )}

                  {/* Notes */}
                  <div className="mt-2.5">
                    {editingNotes === c.id ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Internal notes..."
                          className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-gold focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveNotes(c.id);
                            if (e.key === "Escape") setEditingNotes(null);
                          }}
                        />
                        <button onClick={() => saveNotes(c.id)} className="text-xs text-gold hover:underline">Save</button>
                        <button onClick={() => setEditingNotes(null)} className="text-xs text-text-muted hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingNotes(c.id); setNotesDraft(c.notes ?? ""); }}
                        className="text-xs text-text-muted hover:text-navy-dark transition-colors"
                      >
                        {c.notes ? `📝 ${c.notes}` : "+ Add notes"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Status selector */}
                <div className="relative shrink-0">
                  <div className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${statusConfig[c.status].color}`}>
                    {statusConfig[c.status].label}
                    <ChevronDown className="h-3 w-3" />
                  </div>
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value as Contact["status"])}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  >
                    {statusOptions.map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
