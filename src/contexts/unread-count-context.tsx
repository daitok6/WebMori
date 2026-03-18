"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface UnreadCountContextValue {
  unreadCount: number;
  refreshUnread: () => void;
}

const UnreadCountContext = createContext<UnreadCountContextValue>({
  unreadCount: 0,
  refreshUnread: () => {},
});

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(() => {
    fetch("/api/dashboard/unread")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d: { count: number }) => setUnreadCount(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
  }, [refreshUnread]);

  return (
    <UnreadCountContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}
