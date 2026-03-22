"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Loader2, Mail, Globe, ChevronDown, MessageSquare, Upload, Search } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  url: string | null;
  stack: string | null;
  message: string | null;
  status: "PENDING" | "REVIEWING" | "COMPLETED" | "REJECTED";
  notes: string | null;
  organizationId: string | null;
  userId: string | null;
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
  const [search, setSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: Contact["status"]) {
    const prev = contacts.find((c) => c.id === id);
    setActionError(null);
    // Optimistic update
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        // Revert
        if (prev) setContacts((cs) => cs.map((c) => (c.id === id ? prev : c)));
        setActionError(`Failed to update status (${res.status})`);
      }
    } catch {
      if (prev) setContacts((cs) => cs.map((c) => (c.id === id ? prev : c)));
      setActionError("Network error");
    }
  }

  async function saveNotes(id: string) {
    const prev = contacts.find((c) => c.id === id);
    setActionError(null);
    // Optimistic update
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, notes: notesDraft } : c)));
    setEditingNotes(null);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) {
        if (prev) setContacts((cs) => cs.map((c) => (c.id === id ? prev : c)));
        setActionError(`Failed to save notes (${res.status})`);
      }
    } catch {
      if (prev) setContacts((cs) => cs.map((c) => (c.id === id ? prev : c)));
      setActionError("Network error");
    }
  }

  async function handleUpload(contact: Contact, file: File) {
    setUploading(contact.id);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/contacts/${contact.id}/send-report`, { method: "POST", body: form });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, status: "COMPLETED" } : c)),
        );
      } else {
        const body = await res.json().catch(() => ({}));
        setUploadError(body.error ?? `エラー (${res.status})`);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "ネットワークエラー");
    } finally {
      setUploading(null);
    }
  }

  const searchLower = search.toLowerCase();
  const filtered = contacts
    .filter((c) => filter === "ALL" || c.status === filter)
    .filter((c) =>
      !search ||
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.url && c.url.toLowerCase().includes(searchLower))
    );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Free Evaluation Requests</h1>
          <p className="mt-1 text-sm text-ink-muted">{contacts.length} total</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, URL..."
            className="w-full sm:w-64 rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {["ALL", "PENDING", "REVIEWING", "COMPLETED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-border bg-white text-ink-muted hover:border-ink"
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

      {(uploadError || actionError) && (
        <p className="mt-3 text-sm text-red-600">✗ {uploadError ?? actionError}</p>
      )}

      {filtered.length === 0 ? (
        <Card className="mt-6 py-12 text-center">
          <Mail className="mx-auto mb-3 h-8 w-8 text-ink-muted" />
          <p className="text-ink-muted">{search ? "No matching requests" : "No requests"}</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.userId ? (
                      <Link href={`/admin/users/${c.userId}`} className="font-semibold text-ink hover:text-primary transition-colors">
                        {c.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-ink">{c.name}</p>
                    )}
                    {c.stack && (
                      <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-ink-muted">
                        {c.stack}
                      </span>
                    )}
                    <span className="text-xs text-ink-muted">
                      {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                    <a href={`mailto:${c.email}`} className="hover:text-primary transition-colors flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />{c.email}
                    </a>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />{c.url}
                      </a>
                    )}
                  </div>

                  {c.message && (
                    <p className="mt-2.5 rounded-lg bg-surface-raised px-3 py-2 text-sm text-ink">
                      {c.message}
                    </p>
                  )}

                  {/* Notes */}
                  <div className="mt-2.5">
                    {editingNotes === c.id ? (
                      <div className="flex gap-2">
                        <textarea
                          autoFocus
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Internal notes..."
                          rows={2}
                          className="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setEditingNotes(null);
                          }}
                        />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => saveNotes(c.id)} className="text-xs text-primary hover:underline">Save</button>
                          <button onClick={() => setEditingNotes(null)} className="text-xs text-ink-muted hover:underline">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingNotes(c.id); setNotesDraft(c.notes ?? ""); }}
                        className="text-xs text-ink-muted hover:text-ink transition-colors"
                      >
                        {c.notes ? `📝 ${c.notes}` : "+ Add notes"}
                      </button>
                    )}
                  </div>

                  {/* Upload PDF + Chat actions */}
                  <div className="mt-3 flex items-center gap-3">
                    <label className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      uploading === c.id
                        ? "border-border text-ink-muted opacity-50"
                        : "border-primary/50 text-ink hover:border-primary hover:bg-primary/5"
                    }`}>
                      {uploading === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {uploading === c.id ? "送信中..." : "レポートを送信"}
                      <input
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        disabled={uploading === c.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(c, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {c.organizationId && (
                      <Link
                        href={`/admin/messages?orgId=${c.organizationId}`}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:border-ink hover:text-ink transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        チャット
                      </Link>
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
