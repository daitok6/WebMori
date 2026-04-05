"use client";

import { useEffect, useState } from "react";

export function AdminReviewBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function fetchCount() {
      fetch("/api/admin/reviews?countOnly=true")
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then(({ count }: { count: number }) => setCount(count))
        .catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
