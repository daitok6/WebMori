"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface UnreadCountContextValue {
  unreadCount: number;
  showFreeEval: boolean;
  refreshUnread: () => void;
}

const UnreadCountContext = createContext<UnreadCountContextValue>({
  unreadCount: 0,
  showFreeEval: true,
  refreshUnread: () => {},
});

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFreeEval, setShowFreeEval] = useState(true);

  const refreshUnread = useCallback(() => {
    fetch("/api/dashboard/unread")
      .then((r) => (r.ok ? r.json() : { count: 0, showFreeEval: true }))
      .then((d: { count: number; showFreeEval: boolean }) => {
        setUnreadCount(d.count);
        setShowFreeEval(d.showFreeEval);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUnread();

    let id: ReturnType<typeof setInterval> | null = setInterval(refreshUnread, 30000);

    function handleVisibility() {
      if (document.hidden) {
        if (id) { clearInterval(id); id = null; }
      } else {
        refreshUnread();
        id = setInterval(refreshUnread, 30000);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (id) clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshUnread]);

  return (
    <UnreadCountContext.Provider value={{ unreadCount, showFreeEval, refreshUnread }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}
