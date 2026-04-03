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
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
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
