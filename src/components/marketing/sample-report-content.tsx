"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";

/* ─────────────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────────────── */

const HEALTH_BARS = [
  { label: "セキュリティ",   score: 38 },
  { label: "パフォーマンス", score: 54 },
  { label: "SEO",            score: 67 },
  { label: "i18n / UX",      score: 74 },
  { label: "保守性",         score: 71 },
];

/* score→color for health bar fill (same thresholds as the spec) */
function barColorClass(score: number) {
  if (score < 50) return "bg-severity-critical";
  if (score < 65) return "bg-severity-high";
  if (score < 80) return "bg-severity-medium";
  return "bg-severity-good";
}

/* score→text-color for the score label */
function textColorClass(score: number): string {
  if (score < 50) return "text-severity-critical";
  if (score < 65) return "text-severity-high";
  if (score < 80) return "text-severity-medium";
  return "text-severity-good";
}

/* ─────────────────────────────────────────────────────────────────────────────
   Health Bar (animated on scroll-into-view)
───────────────────────────────────────────────────────────────────────────── */
function HealthBar({ label, score, index }: { label: string; score: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-ink-muted">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-sunken overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColorClass(score)}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 0.7, delay: index * 0.09, ease: "easeOut" }}
        />
      </div>
      <span className={`w-8 text-right text-sm font-bold tabular-nums ${textColorClass(score)}`}>
        {score}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Severity badge pill
───────────────────────────────────────────────────────────────────────────── */
function SeverityBadge({ level }: { level: "critical" | "high" | "medium" | "low" }) {
  const map = {
    critical: { label: "Critical",  cls: "bg-severity-critical/10 text-severity-critical border border-severity-critical/30" },
    high:     { label: "High",      cls: "bg-severity-high/10 text-severity-high border border-severity-high/30" },
    medium:   { label: "Medium",    cls: "bg-severity-medium/10 text-severity-medium border border-severity-medium/30" },
    low:      { label: "Low",       cls: "bg-severity-low/10 text-severity-low border border-severity-low/30" },
  };
  const { label, cls } = map[level];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Status badge
───────────────────────────────────────────────────────────────────────────── */
function StatusBadge({ type }: { type: "manual" | "pr" }) {
  if (type === "pr") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-severity-good/10 text-severity-good border border-severity-good/30 px-2.5 py-0.5 text-xs font-semibold">
        ✅ PR対応済み
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-severity-high/10 text-severity-high border border-severity-high/30 px-2.5 py-0.5 text-xs font-semibold">
      ⚠️ 手動対応が必要
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Finding card shared props
───────────────────────────────────────────────────────────────────────────── */
interface BaseFindingProps {
  title: string;
  location: string;
  status: "manual" | "pr";
  overview: string;
  recommendation: string;
  effort: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Critical / High finding card
───────────────────────────────────────────────────────────────────────────── */
interface CriticalFindingProps extends BaseFindingProps {
  severity: "critical" | "high";
  businessImpact: string;
}

function CriticalFindingCard({
  severity, title, location, status,
  businessImpact, overview, recommendation, effort,
}: CriticalFindingProps) {
  const borderColor = severity === "critical" ? "border-l-severity-critical" : "border-l-severity-high";
  return (
    <div className={`rounded-xl border border-border bg-surface border-l-4 ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3">
        <SeverityBadge level={severity} />
        <code className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-xs text-ink-muted">
          {location}
        </code>
      </div>
      {/* Title */}
      <div className="px-5 pb-3">
        <h3 className="text-base font-bold text-ink leading-snug">{title}</h3>
      </div>
      {/* Business impact callout */}
      <div className="mx-5 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-bold text-amber-700 mb-1">ビジネスへの影響</p>
        <p className="text-sm text-amber-800 leading-relaxed">{businessImpact}</p>
      </div>
      {/* 2-col grid */}
      <div className="grid grid-cols-1 gap-3 px-5 pb-4 sm:grid-cols-2">
        <div className="rounded-lg bg-surface-raised p-3">
          <p className="mb-1 text-xs font-semibold text-ink-muted">概要</p>
          <p className="text-sm text-ink leading-relaxed">{overview}</p>
        </div>
        <div className="rounded-lg bg-surface-raised p-3">
          <p className="mb-1 text-xs font-semibold text-ink-muted">推奨対応</p>
          <p className="text-sm text-ink leading-relaxed">{recommendation}</p>
        </div>
      </div>
      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-raised px-5 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1 text-xs text-ink-muted">
          <span className="font-medium">対応の目安</span>
          {effort}
        </span>
        <StatusBadge type={status} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Medium / Low finding card (lighter styling)
───────────────────────────────────────────────────────────────────────────── */
interface MediumFindingProps extends BaseFindingProps {
  severity: "medium" | "low";
}

function MediumFindingCard({
  severity, title, location, status,
  overview, recommendation, effort,
}: MediumFindingProps) {
  const borderColor = severity === "medium" ? "border-l-severity-medium" : "border-l-severity-low";
  return (
    <div className={`rounded-xl border border-border bg-surface border-l-[3px] ${borderColor} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3">
        <SeverityBadge level={severity} />
        <code className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-xs text-ink-muted">
          {location}
        </code>
      </div>
      <div className="px-5 pb-3">
        <h3 className="text-sm font-semibold text-ink leading-snug">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 px-5 pb-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-ink-muted">概要</p>
          <p className="text-sm text-ink-muted leading-relaxed">{overview}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-ink-muted">推奨対応</p>
          <p className="text-sm text-ink-muted leading-relaxed">{recommendation}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-raised px-5 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1 text-xs text-ink-muted">
          <span className="font-medium">対応の目安</span>
          {effort}
        </span>
        <StatusBadge type={status} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */
export function SampleReportContent() {
  return (
    <>
      {/* ── Demo banner ── */}
      <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm text-amber-800">
        これはサンプルレポートです。実際のレポートは毎月ご契約のサイトに対して生成されます。
      </div>

      {/* ── Report cover ── */}
      <section className="bg-[#0F1923] px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                WebMori ウェブ守り
              </p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl leading-snug">
                月次ウェブ監査レポート
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "クライアント", value: "株式会社さくら雑貨" },
                { label: "対象サイト",   value: "sakura-zakka.jp" },
                { label: "監査日",       value: "2026年4月" },
                { label: "プラン",       value: "Growth" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm"
                >
                  <span className="text-white/50 text-xs mr-1.5">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
            {/* Overall score */}
            <div className="mt-8 inline-flex flex-col items-start gap-1">
              <span className="text-xs text-white/40 uppercase tracking-wider">総合スコア</span>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-white leading-none">61</span>
                <span className="text-2xl text-white/40 mb-1 font-light">/ 100</span>
              </div>
              <span className="text-xs text-severity-high font-semibold">改善が必要</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Executive summary ── */}
      <section className="bg-surface py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-4">概要</h2>
            <p className="text-ink-muted leading-relaxed mb-6">
              今月の監査では、セキュリティ面で2件の重大な問題が確認されました。特に本番APIキーのリポジトリ露出は即時対応が必要です。
              パフォーマンスについてはスマートフォンでのページ読み込みに5秒以上かかるケースがあり、購入率への影響が懸念されます。
              一方で保守性・UX面は比較的良好で、軽微な修正で大きく改善できる余地があります。
              今月はPR対応済み3件を含む計6件の問題を検出しました。
            </p>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="rounded-lg border border-severity-critical/30 bg-severity-critical/5 px-4 py-3 text-center min-w-[110px]">
                <p className="text-2xl font-black text-severity-critical">2件</p>
                <p className="text-xs text-ink-muted mt-0.5">Critical</p>
              </div>
              <div className="rounded-lg border border-severity-good/30 bg-severity-good/5 px-4 py-3 text-center min-w-[110px]">
                <p className="text-2xl font-black text-severity-good">3件</p>
                <p className="text-xs text-ink-muted mt-0.5">PR対応済み</p>
              </div>
              <div className="rounded-lg border border-severity-high/30 bg-severity-high/5 px-4 py-3 text-center min-w-[110px]">
                <p className="text-2xl font-black text-severity-high">3件</p>
                <p className="text-xs text-ink-muted mt-0.5">手動対応</p>
              </div>
            </div>

            {/* Health bars */}
            <div className="space-y-3">
              {HEALTH_BARS.map((bar, i) => (
                <HealthBar key={bar.label} label={bar.label} score={bar.score} index={i} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Critical / High findings ── */}
      <section className="bg-surface-raised py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-1">重要な問題（Critical / High）</h2>
            <p className="text-sm text-ink-muted mb-6">今月中に対応が必要な問題です。</p>
          </ScrollReveal>

          <div className="space-y-5">
            <ScrollReveal delay={0.05}>
              <CriticalFindingCard
                severity="critical"
                title="LINE webhook署名検証が未実装"
                location="api/line/webhook.ts"
                status="manual"
                businessImpact="偽のWebhookリクエストを受信することで、不正な注文処理や在庫操作が発生するリスクがあります。ECサイトでは直接的な金銭被害につながる可能性があります。"
                overview="LINEからのWebhookリクエストに対して X-Line-Signature ヘッダーの検証が実施されていません。悪意ある第三者がリクエストを偽造できる状態です。"
                recommendation="line-bot-sdk を使用して X-Line-Signature ヘッダーの検証を追加してください。validateSignature() 関数を全受信リクエストに適用します。"
                effort="約1〜2時間"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <CriticalFindingCard
                severity="critical"
                title="本番APIキーがGitHubリポジトリに露出"
                location=".env.production"
                status="manual"
                businessImpact="Stripeの本番シークレットキーが公開リポジトリに含まれており、第三者が不正決済を実行できる状態です。発覚した場合のブランド信頼失墜も深刻です。"
                overview=".env.production ファイルが .gitignore に含まれておらず、Stripeの sk_live_ キーがリポジトリ履歴に残存しています。"
                recommendation="①Stripeダッシュボードで該当キーを即時無効化　②新しいシークレットキーを発行　③Vercelの環境変数に移行　④.gitignore を修正してコミット履歴をクリーンアップ"
                effort="約30分（緊急）"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <CriticalFindingCard
                severity="high"
                title="商品画像が未最適化（合計92MB）"
                location="public/products/"
                status="manual"
                businessImpact="スマートフォンでのLCPが5.8秒と計測され、業界標準（2.5秒以下）を大きく超えています。モバイルユーザーの購入離脱率に直接影響します。"
                overview="public/products/ 以下の画像ファイルが PNG のまま未圧縮で配置されており、合計92MBになっています。next/image の sizes 属性も未設定です。"
                recommendation="WebP形式への変換（ファイルサイズ約70%削減見込み）と next/image コンポーネントへの置き換え、sizes 属性の適切な設定を行います。"
                effort="約2〜3時間"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Medium / Low findings ── */}
      <section className="bg-surface py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-1">改善提案（Medium / Low）</h2>
            <p className="text-sm text-ink-muted mb-6">プルリクエストで対応済み、または次回スプリントで対応可能な問題です。</p>
          </ScrollReveal>

          <div className="space-y-4">
            <ScrollReveal delay={0.05}>
              <MediumFindingCard
                severity="medium"
                title="カートページにCSRF対策が未設定"
                location="app/cart/page.tsx"
                status="pr"
                overview="カートのフォーム送信にCSRFトークンが実装されていないため、クロスサイトリクエストフォージェリ攻撃のリスクがあります。"
                recommendation="Next.jsのServer ActionsにCSRFトークン検証を追加します。PR-1として実装済みです。"
                effort="自動修正済み（PR-1）"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <MediumFindingCard
                severity="medium"
                title="メタディスクリプションが全ページ同一"
                location="全ページ"
                status="pr"
                overview="全ページで同一のメタディスクリプションが設定されており、検索エンジンでのクリック率低下・重複コンテンツ評価につながります。"
                recommendation="各ページの内容に合わせた個別のメタディスクリプションを設定します。PR-2として実装済みです。"
                effort="自動修正済み（PR-2）"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <MediumFindingCard
                severity="low"
                title="console.logが本番ビルドに残存"
                location="複数ファイル（8箇所）"
                status="pr"
                overview="開発用の console.log が本番環境にそのまま残っており、ブラウザの開発者ツールから内部情報が参照可能な状態です。"
                recommendation="ESLintルールで no-console を有効化し、ビルド時に自動除去します。PR-3として実装済みです。"
                effort="自動修正済み（PR-3）"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 今月の優先対応 ── */}
      <section className="bg-surface-raised py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-6">今月の優先対応</h2>
            <ol className="space-y-4">
              {[
                {
                  title: "本番APIキーの即時無効化・環境変数移行",
                  reason: "公開リポジトリへの露出は緊急対応が必要です。Stripeキーを直ちに無効化し、新しいキーを発行してください。",
                },
                {
                  title: "LINE webhook署名検証の実装",
                  reason: "不正注文リスクを解消するセキュリティ最重要課題です。ECサイトとして金銭被害に直結します。",
                },
                {
                  title: "商品画像のWebP変換・最適化",
                  reason: "LCPを5.8秒→2秒台に改善し、スマートフォンでの購入率向上に直結します。",
                },
              ].map((item, idx) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-sm font-black text-white"
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-ink">{item.title}</span>
                    <span className="text-ink-muted"> — {item.reason}</span>
                  </div>
                </li>
              ))}
            </ol>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ビジネス影響サマリー ── */}
      <section className="bg-surface py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-4">ビジネス影響サマリー</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-raised">
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">項目</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">スコア</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">状況</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">優先度</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { category: "セキュリティ",   score: 38, status: "🔴 緊急対応が必要",  priority: "高" },
                    { category: "パフォーマンス", score: 54, status: "🟠 改善が必要",      priority: "高" },
                    { category: "SEO",            score: 67, status: "🟡 部分的に改善中",  priority: "中" },
                    { category: "i18n / UX",      score: 74, status: "🟡 軽微な改善余地", priority: "低" },
                    { category: "保守性",         score: 71, status: "🟡 軽微な改善余地", priority: "低" },
                  ].map((row) => (
                    <tr key={row.category} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{row.category}</td>
                      <td className="px-4 py-3 tabular-nums text-ink-muted">{row.score}/100</td>
                      <td className="px-4 py-3 text-ink-muted">{row.status}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${row.priority === "高" ? "text-severity-high" : row.priority === "中" ? "text-severity-medium" : "text-ink-muted"}`}>
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PR一覧 ── */}
      <section className="bg-surface-raised py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-4">プルリクエスト一覧</h2>
            <p className="text-sm text-ink-muted mb-4">
              以下のPRはマージすることで即座に有効になります。コードのレビュー後、ご判断ください。
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted w-16">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">内容</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">重要度</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">リンク</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "PR-1", title: "CSRFトークンをカートフォームに追加",          severity: "medium" as const },
                    { id: "PR-2", title: "全ページのメタディスクリプションを個別設定",  severity: "low" as const },
                    { id: "PR-3", title: "本番ビルドからconsole.logを削除",             severity: "low" as const },
                  ].map((pr) => (
                    <tr key={pr.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs font-mono text-ink-muted">{pr.id}</code>
                      </td>
                      <td className="px-4 py-3 text-ink">{pr.title}</td>
                      <td className="px-4 py-3"><SeverityBadge level={pr.severity} /></td>
                      <td className="px-4 py-3 text-xs text-ink-subtle italic">（ご契約後に提供）</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 手動対応テーブル ── */}
      <section className="bg-surface py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-4">手動対応が必要な項目</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-raised">
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted w-16">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">内容</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">参照ファイル</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-muted">作業量</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "M-1", title: "Stripeキーを無効化し環境変数に移行",  file: ".env.production",     effort: "約30分（緊急）" },
                    { id: "M-2", title: "LINE webhook署名検証を実装",           file: "api/line/webhook.ts", effort: "約1〜2時間" },
                    { id: "M-3", title: "商品画像をWebP変換・圧縮",            file: "public/products/",    effort: "約2〜3時間" },
                  ].map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs font-mono text-ink-muted">{item.id}</code>
                      </td>
                      <td className="px-4 py-3 text-ink">{item.title}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-ink-muted">{item.file}</code>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{item.effort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 実装代行オプション ── */}
      <section className="bg-surface-raised py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-2">実装代行オプション</h2>
            <p className="text-sm text-ink-muted mb-6">
              修正作業をWebMoriに依頼することも可能です。ご予算に合わせて3つのプランからお選びください。
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Tier A */}
              <div className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="border-b border-border bg-[#0F1923] px-4 py-3">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tier A</p>
                  <p className="text-sm font-bold text-white mt-0.5">WebMori代行</p>
                  <p className="text-xs text-white/50 mt-0.5">¥7,500/hr（PRは¥5,000均一）</p>
                </div>
                <div className="p-4">
                  <table className="w-full text-xs">
                    <thead className="sr-only">
                      <tr>
                        <th scope="col">対象</th>
                        <th scope="col">作業内容</th>
                        <th scope="col">料金</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { ref: "PR-1", label: "CSRFトークン追加",     price: "¥5,000" },
                        { ref: "PR-2", label: "メタ個別設定",         price: "¥5,000" },
                        { ref: "PR-3", label: "console.log削除",      price: "¥5,000" },
                        { ref: "M-3",  label: "画像最適化（WebP変換）", price: "¥15,000" },
                      ].map((item) => (
                        <tr key={item.ref}>
                          <td className="py-2 pr-2">
                            <code className="text-ink-subtle">{item.ref}</code>
                          </td>
                          <td className="py-2 text-ink-muted">{item.label}</td>
                          <td className="py-2 text-right font-semibold text-ink">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tier B */}
              <div className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="border-b border-border px-4 py-3 bg-[#1a2d3e]">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">Tier B</p>
                  <p className="text-sm font-bold text-white mt-0.5">ステージング確認あり</p>
                  <p className="text-xs text-white/50 mt-0.5">¥9,000/hr</p>
                </div>
                <div className="p-4">
                  <table className="w-full text-xs">
                    <thead className="sr-only">
                      <tr>
                        <th scope="col">対象</th>
                        <th scope="col">作業内容</th>
                        <th scope="col">料金</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { ref: "M-2", label: "LINE webhook実装", hours: "約2時間", price: "¥18,000" },
                      ].map((item) => (
                        <tr key={item.ref}>
                          <td className="py-2 pr-2">
                            <code className="text-ink-subtle">{item.ref}</code>
                          </td>
                          <td className="py-2 text-ink-muted">{item.label}</td>
                          <td className="py-2 text-right font-semibold text-ink">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-ink-subtle">ステージング環境で確認後、お客様がプロダクションに適用</p>
                </div>
              </div>

              {/* Tier C */}
              <div className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="border-b border-border px-4 py-3 bg-[#1e2a1e]">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Tier C</p>
                  <p className="text-sm font-bold text-white mt-0.5">実装ガイド</p>
                  <p className="text-xs text-white/50 mt-0.5">¥12,000均一（1hr Q&amp;A込み）</p>
                </div>
                <div className="p-4">
                  <table className="w-full text-xs">
                    <thead className="sr-only">
                      <tr>
                        <th scope="col">対象</th>
                        <th scope="col">作業内容</th>
                        <th scope="col">料金</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { ref: "M-1", label: "APIキー移行ガイド", price: "¥12,000" },
                      ].map((item) => (
                        <tr key={item.ref}>
                          <td className="py-2 pr-2">
                            <code className="text-ink-subtle">{item.ref}</code>
                          </td>
                          <td className="py-2 text-ink-muted">{item.label}</td>
                          <td className="py-2 text-right font-semibold text-ink">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-ink-subtle">詳細な手順書＋1時間のQ&amp;Aセッション付き</p>
                </div>
              </div>
            </div>

            {/* Grand total */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-6 py-4">
              <span className="text-sm font-semibold text-amber-800">全項目対応の場合</span>
              <span className="text-2xl font-black text-amber-900">¥60,000<span className="text-sm font-normal text-amber-700 ml-1">（税別）</span></span>
            </div>

            {/* CTA button */}
            <div className="mt-6 text-center">
              <Link
                href="/dashboard/free-eval"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                実装をWebMoriに依頼する →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 来月の予定 ── */}
      <section className="bg-surface py-12 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-ink mb-4">来月の予定</h2>
            <ul className="space-y-2">
              {[
                "今月の修正後のパフォーマンス改善効果を確認（LCP・INP再計測）",
                "モバイルUX・フォームのアクセシビリティチェック（WCAG 2.1 AA基準）",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-subtle" />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="relative overflow-hidden bg-[#0F1923] py-20 px-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at top right, rgba(201,168,76,0.18), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              あなたのサイトも診断してみませんか？
            </h2>
            <p className="mt-4 text-base text-white/60 max-w-xl mx-auto">
              毎月プロが確認する。問題は見つかる前に潰す。WebMoriは東京の中小企業・フリーランスのサイトを守る月次監査サービスです。
            </p>
            <Link
              href="/dashboard/free-eval"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              無料で診断を試す →
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
