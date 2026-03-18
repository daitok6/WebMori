"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
