"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useUnreadCount } from "@/contexts/unread-count-context";

interface Message {
  id: string;
  content: string;
  fromOperator: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const t = useTranslations("dashboard.messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { refreshUnread } = useUnreadCount();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function fetchMessages() {
    fetch("/api/dashboard/messages")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          // Mark operator messages as read and refresh nav badge
          fetch("/api/dashboard/messages/read", { method: "POST" })
            .then(() => refreshUnread())
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      {/* Message thread */}
      <Card className="mt-4 flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageSquare className="mb-4 h-10 w-10 text-ink-muted" />
            <p className="font-medium text-ink">{t("noMessages")}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {t("noMessagesDesc")}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.fromOperator ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                    msg.fromOperator
                      ? "bg-surface-raised text-ink"
                      : "bg-stone-900 text-white"
                  }`}
                >
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {msg.fromOperator ? t("operator") : t("you")}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="mt-1 text-[10px] opacity-50">
                    {new Date(msg.createdAt).toLocaleString("ja-JP")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Send form */}
        <form
          onSubmit={handleSend}
          className="border-t border-border p-4 flex gap-2"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("placeholder")}
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" disabled={sending || !content.trim()} size="sm">
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
