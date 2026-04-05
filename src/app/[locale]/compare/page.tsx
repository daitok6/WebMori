import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: "競合比較",
    alternates: {
      canonical: `https://www.webmori.jp/${locale}/compare`,
      languages: { ja: "/ja/compare", en: "/en/compare" },
    },
  };
}

type CompetitorRow = {
  name: string;
  humanReview: boolean;
  japaneseReport: boolean;
  businessImpact: boolean;
  lineAudit: boolean;
  implementation: boolean;
  price: string;
  isWebMori?: boolean;
};

const competitors: CompetitorRow[] = [
  {
    name: "WebMori",
    humanReview: true,
    japaneseReport: true,
    businessImpact: true,
    lineAudit: true,
    implementation: true,
    price: "¥19,800〜/月",
    isWebMori: true,
  },
  {
    name: "GMOネットde診断 Lite",
    humanReview: false,
    japaneseReport: false,
    businessImpact: false,
    lineAudit: false,
    implementation: false,
    price: "¥4,280/月",
  },
  {
    name: "WordPress保守代行（一般）",
    humanReview: false,
    japaneseReport: false,
    businessImpact: false,
    lineAudit: false,
    implementation: false,
    price: "¥34,008/月",
  },
  {
    name: "Semrush / Ahrefs",
    humanReview: false,
    japaneseReport: false,
    businessImpact: false,
    lineAudit: false,
    implementation: false,
    price: "¥15,000/月相当",
  },
  {
    name: "自分でやる",
    humanReview: false,
    japaneseReport: false,
    businessImpact: false,
    lineAudit: false,
    implementation: false,
    price: "¥0（時間コスト大）",
  },
];

const columns = [
  { key: "humanReview", label: "人間レビュー" },
  { key: "japaneseReport", label: "日本語レポート" },
  { key: "businessImpact", label: "ビジネスインパクト説明" },
  { key: "lineAudit", label: "LINE API監査" },
  { key: "implementation", label: "実装代行" },
  { key: "price", label: "月額" },
] as const;

const differentiators = [
  {
    title: "人間が読んで、問題の「意味」を説明します",
    desc: "自動スキャンは脆弱性を列挙するだけ。WebMoriは経営者が読めるレポートを作ります。",
  },
  {
    title: "経営者が読めるレポート",
    desc: "技術用語なし、ビジネス影響で説明。「この問題で顧客が離れているかもしれません」という視点で届けます。",
  },
  {
    title: "LINE APIに特化した日本市場対応",
    desc: "LINE Webhook署名検証・LIFF設定・トークン管理など、競合にはない独自の監査領域をカバーします。",
  },
  {
    title: "監査＋実装のワンストップ",
    desc: "問題発見から修正まで1社完結。別の業者に依頼する手間も、説明のやり取りも不要です。",
  },
];

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
              競合比較
            </span>
            <h1 className="text-4xl font-bold text-ink sm:text-5xl leading-tight">
              なぜWebMoriを選ぶのか
            </h1>
            <p className="mt-6 text-lg text-ink-muted max-w-2xl mx-auto">
              自動スキャンツールや保守代行との違いを、機能と価格で比較します。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-left font-semibold text-ink min-w-[160px]">
                      サービス
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="py-3 px-2 text-center font-semibold text-ink text-xs leading-tight min-w-[80px]"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border",
                        row.isWebMori && "bg-primary/5",
                      )}
                    >
                      <td className="py-4 pr-4">
                        <span
                          className={cn(
                            "font-medium",
                            row.isWebMori ? "text-primary font-bold" : "text-ink",
                          )}
                        >
                          {row.name}
                          {row.isWebMori && (
                            <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                              YOU
                            </span>
                          )}
                        </span>
                      </td>
                      {(
                        [
                          "humanReview",
                          "japaneseReport",
                          "businessImpact",
                          "lineAudit",
                          "implementation",
                        ] as const
                      ).map((key) => (
                        <td key={key} className="py-4 px-2 text-center">
                          {row[key] ? (
                            <Check className="inline-block h-5 w-5 text-severity-good" />
                          ) : (
                            <X className="inline-block h-5 w-5 text-severity-critical/50" />
                          )}
                        </td>
                      ))}
                      <td
                        className={cn(
                          "py-4 px-2 text-center text-xs font-medium",
                          row.isWebMori ? "text-primary font-bold" : "text-ink-muted",
                        )}
                      >
                        {row.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why pay 5x section */}
      <section className="bg-surface-raised py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink mb-4">
              なぜ5倍払うのか
            </h2>
            <p className="text-center text-ink-muted mb-12">
              自動ツールよりコストがかかる理由は、提供する価値が根本的に異なるからです。
            </p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {differentiators.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
                      <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-primary sm:text-4xl mb-4">
              まずは無料で試してみてください
            </h2>
            <p className="text-white/70 mb-8">
              初回監査は無料です。自動スキャンとの違いを実際のレポートで確認してください。
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              料金プランを見る
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
