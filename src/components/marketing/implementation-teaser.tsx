import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function ImplementationTeaser() {
  return (
    <section className="bg-surface-raised py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">新機能</span>
            <h2 className="mt-2 text-3xl font-bold text-ink">見つけた問題、そのまま修正まで</h2>
            <p className="mt-3 max-w-2xl mx-auto text-ink-muted">
              毎月のレポートには、各問題の実装代行見積もりが自動で記載されます。
              ご希望の項目をご連絡いただければ、WebMoriが安全に修正します。
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {[
            { tier: "A", label: "完全代行", price: "¥7,500/時", desc: "低リスクの修正を直接実装", color: "green" },
            { tier: "B", label: "ステージング確認", price: "¥9,000/時", desc: "中リスクはステージングで検証", color: "orange" },
            { tier: "C", label: "実装ガイド", price: "¥12,000固定", desc: "複雑な変更はガイド＋Q&A", color: "rose" },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="rounded-lg border border-border bg-surface p-5 text-center">
                <span className={`inline-block mb-2 text-xs font-bold uppercase tracking-wider ${
                  item.color === "green" ? "text-green-600" :
                  item.color === "orange" ? "text-orange-500" : "text-rose-500"
                }`}>Tier {item.tier} — {item.label}</span>
                <p className="text-xl font-bold text-ink">{item.price}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              実装代行の詳細を見る <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
