"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Send, ChevronLeft } from "lucide-react";

interface OrgSummary {
  id: string;
  name: string;
  email: string | null;
  userId: string | null;
  lastMessage: { content: string; fromOperator: boolean; createdAt: string } | null;
  messageCount: number;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  fromOperator: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const searchParams = useSearchParams();
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrgSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: OrgSummary[]) => {
        setOrgs(data);
        // Auto-select org from URL param
        const orgId = searchParams.get("orgId");
        if (orgId) {
          const target = data.find((o) => o.id === orgId);
          if (target) selectOrg(target);
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function selectOrg(org: OrgSummary) {
    setSelectedOrg(org);
    const msgs = await fetch(`/api/admin/messages/${org.id}`).then((r) =>
      r.ok ? r.json() : [],
    );
    setMessages(msgs);
    if (org.unreadCount > 0) {
      await fetch(`/api/admin/messages/${org.id}/read`, { method: "POST" });
      setOrgs((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, unreadCount: 0 } : o)),
      );
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: selectedOrg.id, content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        const msgs = await fetch(`/api/admin/messages/${selectedOrg.id}`).then(
          (r) => (r.ok ? r.json() : []),
        );
        setMessages(msgs);
        fetch("/api/admin/messages")
          .then((r) => r.json())
          .then((updated: OrgSummary[]) =>
            setOrgs(updated.map((o) =>
              o.id === selectedOrg.id ? { ...o, unreadCount: 0 } : o,
            )),
          );
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">Messages</h1>

      <div className="mt-6 flex gap-4 h-[calc(100vh-12rem)]">
        {/* Client list */}
        <div className={`w-64 flex-shrink-0 space-y-2 overflow-y-auto ${selectedOrg ? "hidden sm:block" : ""}`}>
          {orgs.length === 0 ? (
            <Card className="py-8 text-center">
              <MessageSquare className="mx-auto mb-2 h-6 w-6 text-text-muted" />
              <p className="text-sm text-text-muted">No clients yet</p>
            </Card>
          ) : (
            orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => selectOrg(org)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedOrg?.id === org.id
                    ? "border-gold bg-gold/5"
                    : "border-border bg-white hover:border-gold/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-navy-dark text-sm truncate">{org.name}</p>
                  {org.unreadCount > 0 && (
                    <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {org.unreadCount > 9 ? "9+" : org.unreadCount}
                    </span>
                  )}
                </div>
                {org.email && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{org.email}</p>
                )}
                {org.lastMessage && (
                  <p className={`text-xs mt-1 truncate ${org.unreadCount > 0 && !org.lastMessage.fromOperator ? "text-navy-dark font-medium" : "text-text-muted"}`}>
                    {org.lastMessage.fromOperator ? "You: " : ""}
                    {org.lastMessage.content}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Thread */}
        {selectedOrg ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button
                onClick={() => setSelectedOrg(null)}
                className="sm:hidden text-text-muted hover:text-navy-dark"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                {selectedOrg.userId ? (
                  <Link
                    href={`/admin/users/${selectedOrg.userId}`}
                    className="font-semibold text-navy-dark hover:text-gold transition-colors"
                  >
                    {selectedOrg.name}
                  </Link>
                ) : (
                  <p className="font-semibold text-navy-dark">{selectedOrg.name}</p>
                )}
                {selectedOrg.email && (
                  <p className="text-xs text-text-muted">{selectedOrg.email}</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-text-muted">
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromOperator ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                        msg.fromOperator
                          ? "bg-navy-dark text-white"
                          : "bg-bg-cream text-navy-dark"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-60">
                        {msg.fromOperator ? "You" : selectedOrg.name}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="mt-1 text-[10px] opacity-50">
                        {new Date(msg.createdAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-border p-4 flex gap-2"
            >
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Button type="submit" size="sm" disabled={sending || !content.trim()}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center text-text-muted text-sm">
            Select a client to view their messages
          </div>
        )}
      </div>
    </>
  );
}
