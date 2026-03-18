"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Globe, MessageSquare } from "lucide-react";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  url: string | null;
  stack: string | null;
  message: string | null;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">Contact Requests</h1>
      <p className="mt-1 text-sm text-text-muted">
        {contacts.length} total submissions
      </p>

      {contacts.length === 0 ? (
        <Card className="mt-6 py-12 text-center">
          <Mail className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <p className="text-text-muted">No contact requests yet</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {contacts.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy-dark">{c.name}</p>
                    {c.stack && <Badge>{c.stack}</Badge>}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-text-muted">
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1 hover:text-gold transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {c.email}
                    </a>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-gold transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {c.url}
                      </a>
                    )}
                  </div>
                  {c.message && (
                    <p className="mt-3 text-sm text-text-body bg-bg-cream rounded-lg p-3">
                      {c.message}
                    </p>
                  )}
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap ml-4">
                  {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
