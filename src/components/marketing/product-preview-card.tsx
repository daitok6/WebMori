"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Static demo data ── */
const FINDINGS = [
  { severity: "Critical", label: "Critical", text: "LINE webhookに署名検証が実装されていない", color: "bg-severity-critical/10 border-severity-critical text-severity-critical" },
  { severity: "High",     label: "High",     text: "APIルートに認証ミドルウェアが未設定",         color: "bg-severity-high/10 border-severity-high text-severity-high" },
  { severity: "Medium",   label: "Medium",   text: "画像の最適化が未実施（LCP +3.2秒）",           color: "bg-severity-medium/10 border-severity-medium text-severity-medium" },
  { severity: "Medium",   label: "Medium",   text: "セキュリティヘッダーが一部不足",               color: "bg-severity-medium/10 border-severity-medium text-severity-medium" },
  { severity: "Low",      label: "Low",      text: "未使用の依存関係（12パッケージ）",             color: "bg-severity-good/10 border-severity-good text-severity-good" },
];

const BEFORE_ITEMS = [
  { color: "bg-severity-critical", text: "LINE署名検証なし" },
  { color: "bg-severity-critical", text: "認証なしAPIルート" },
  { color: "bg-severity-high",     text: "LCP 6.2秒" },
  { color: "bg-severity-high",     text: "旧プラグイン12個" },
];
const AFTER_ITEMS = [
  { color: "bg-severity-good", text: "署名検証 実装済" },
  { color: "bg-severity-good", text: "全APIに認証追加" },
  { color: "bg-severity-good", text: "LCP 1.8秒" },
  { color: "bg-severity-good", text: "依存関係 最新化" },
];

const SCORE_BARS = [
  { label: "セキュリティ",      value: 38, color: "bg-severity-critical", textColor: "text-severity-critical" },
  { label: "パフォーマンス",    value: 61, color: "bg-severity-medium",   textColor: "text-severity-medium" },
  { label: "LINE連携",          value: 22, color: "bg-severity-critical", textColor: "text-severity-critical" },
  { label: "i18n / UX",         value: 74, color: "bg-severity-good",     textColor: "text-severity-good" },
  { label: "保守性",            value: 68, color: "bg-severity-medium",   textColor: "text-severity-medium" },
];

const TABS = [
  { id: "findings", label: "診断結果" },
  { id: "ba",       label: "改善前後" },
  { id: "scores",   label: "スコア" },
] as const;

type TabId = "findings" | "ba" | "scores";

/* ── Sub-panels ── */
function FindingsPanel() {
  return (
    <div className="px-4 py-3 flex flex-col gap-1.5">
      {FINDINGS.map((f, i) => (
        <div
          key={i}
          className={cn("flex items-center gap-2 px-2.5 py-2 rounded-lg border-l-[3px]", f.color.split(" ")[0], f.color.split(" ")[1])}
        >
          <span className={cn("text-[10px] font-bold min-w-[50px]", f.color.split(" ")[2])}>
            {f.label}
          </span>
          <span className="text-[11px] text-ink-muted leading-tight">{f.text}</span>
        </div>
      ))}
    </div>
  );
}

function BeforeAfterPanel() {
  return (
    <div className="px-4 py-3">
      {/* Headers + scores */}
      <div className="grid grid-cols-[1fr_auto_1fr] mb-3">
        <div>
          <div className="text-[10px] font-bold text-severity-critical mb-2">❌ 診断前</div>
          <span className="text-[28px] font-black leading-none text-severity-critical">38</span>
          <div className="text-[8px] uppercase tracking-wider text-ink-subtle mt-0.5">総合スコア</div>
        </div>
        <div className="px-2.5" />
        <div>
          <div className="text-[10px] font-bold text-severity-good mb-2">✅ 修正後</div>
          <span className="text-[28px] font-black leading-none text-severity-good">91</span>
          <div className="text-[8px] uppercase tracking-wider text-ink-subtle mt-0.5">総合スコア</div>
        </div>
      </div>

      {/* Bullet lists + absolutely centered arrow */}
      <div className="relative grid grid-cols-2 gap-2">
        {/* Arrow pinned to exact center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-sm text-primary font-bold">→</span>
        </div>
        <div className="pr-3">
          {BEFORE_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-[4px] shrink-0", item.color)} />
              <span className="text-[10px] text-ink-muted leading-tight">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="pl-3">
          {AFTER_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-[4px] shrink-0", item.color)} />
              <span className="text-[10px] text-ink-muted leading-tight">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoresPanel() {
  return (
    <div className="px-4 py-3 flex flex-col gap-2.5">
      {SCORE_BARS.map((bar, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="text-[10px] text-ink-muted w-[80px] shrink-0">{bar.label}</span>
          <div className="flex-1 h-[5px] bg-surface-sunken rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", bar.color)}
              initial={{ width: 0 }}
              animate={{ width: `${bar.value}%` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
            />
          </div>
          <span className={cn("text-[10px] font-bold w-6 text-right", bar.textColor)}>{bar.value}</span>
        </div>
      ))}
    </div>
  );
}

const TAB_IDS = TABS.map((t) => t.id);
const ROTATE_MS = 3000;

/* ── Main component ── */
export function ProductPreviewCard() {
  const [active, setActive] = useState<TabId>("findings");
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((cur) => {
        const idx = TAB_IDS.indexOf(cur);
        return TAB_IDS[(idx + 1) % TAB_IDS.length] as TabId;
      });
    }, ROTATE_MS);
  };

  useEffect(() => {
    if (!paused) startInterval();
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const handleTabClick = (id: TabId) => {
    setActive(id);
    // Reset interval so the tab gets full 3s before advancing
    if (!paused) startInterval();
  };

  const panelMap: Record<TabId, React.ReactNode> = {
    findings: <FindingsPanel />,
    ba:       <BeforeAfterPanel />,
    scores:   <ScoresPanel />,
  };

  return (
    <div
      className="w-full max-w-[420px] mx-auto rounded-2xl border border-border bg-surface shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-bold text-ink">example-shop.jp</span>
        <span className="text-[10px] text-ink-subtle">2026年4月 · Growthプラン</span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "text-[11px] font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer",
              active === tab.id
                ? "bg-primary text-white"
                : "bg-surface-sunken text-ink-muted hover:bg-surface-raised hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="min-h-[180px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {panelMap[active]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-raised border-t border-border">
        <span className="text-[10px] text-ink-subtle">Growthプラン · 月次監査</span>
        <span className="text-[11px] font-bold text-primary">フルレポートを見る →</span>
      </div>
    </div>
  );
}
