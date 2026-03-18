"use client";

import { useEffect, useState } from "react";

export function AdminUnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function fetchCount() {
      fetch("/api/admin/messages")
        .then((r) => (r.ok ? r.json() : []))
        .then((orgs: { unreadCount: number }[]) => {
          const total = orgs.reduce((sum, o) => sum + (o.unreadCount ?? 0), 0);
          setCount(total);
        })
        .catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
