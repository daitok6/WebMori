import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("services")} | WebMori`,
  };
}

export default function ServicesPage() {
  const tiers = [
    {
      label: "Tier A",
      name: "完全代行",
      price: "¥7,500",
      unit: "/時",
      sub: "PR適用: ¥5,000固定",
      accent: "border-green-500",
      accentText: "text-green-600",
      accentBg: "bg-green-500",
      description:
        "リスクの低い修正（画像最適化、フォント、設定変更など）をWebMoriが直接実装します。",
      bullets: [
        "画像・アセット最適化",
        "フォント自ホスト化",
        "タイミングセーフ比較",
        "CSS・レスポンシブ修正",
        "設定ファイル変更",
      ],
    },
    {
      label: "Tier B",
      name: "ステージング確認",
      price: "¥9,000",
      unit: "/時",
      sub: " ",
      accent: "border-orange-400",
      accentText: "text-orange-500",
      accentBg: "bg-orange-400",
      description:
        "認証・セッション・外部API連携など中リスクの修正をステージング環境で確認のうえ実装します。",
      bullets: [
        "認証・セッション処理",
        "フォームバリデーション",
        "LINE・外部API連携",
        "依存パッケージ更新",
        "エラーハンドリング",
      ],
    },
    {
      label: "Tier C",
      name: "実装ガイド",
      price: "¥12,000",
      unit: "固定",
      sub: " ",
      accent: "border-rose-400",
      accentText: "text-rose-500",
      accentBg: "bg-rose-400",
      description:
        "高リスクまたは複雑な修正（i18n化、DB変更など）はガイドドキュメント＋1時間Q&Aでサポートします。",
      bullets: [
        "UI文字列のi18n化",
        "データベーススキーマ変更",
        "複雑なリファクタリング",
        "アーキテクチャ変更",
        "16時間超の大規模作業",
      ],
    },
  ];

  const steps = [
    {
      num: 1,
      title: "監査で問題を特定",
      desc: "毎月の監査レポートに、各問題の実装代行見積もりが記載されています。",
    },
    {
      num: 2,
      title: "ご希望の項目を選択",
      desc: "PR番号・手動対応番号（M-1 など）をLINEまたはメールでお知らせください。",
    },
    {
      num: 3,
      title: "WebMoriが安全に実装",
      desc: "Tierに応じた安全確認プロセスのあと、修正をデプロイします。翌営業日以内にご返答します。",
    },
  ];

  const faqs = [
    {
      q: "何かトラブルがあった場合は？",
      a: "Tier A/Bの修正はステージング確認済みです。万一の場合もロールバック手順を提供します。",
    },
    {
      q: "見積もりは変わることがありますか？",
      a: "レポート記載の見積もりは目安です。作業前に確定見積もりをお伝えします。",
    },
    {
      q: "監査プランに加入していなくても利用できますか？",
      a: "実装代行は月次監査プランのオプションです。まず監査プランにご加入ください。",
    },
    {
      q: "対応できないケースはありますか？",
      a: "DB移行・決済フロー変更・インフラ構成変更など一部の高リスク作業はお断りする場合があります。",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
              監査で見つけた問題、WebMoriが直接修正します
            </span>
            <h1 className="text-4xl font-bold text-ink sm:text-5xl leading-tight">
              発見から修正まで、<br className="hidden sm:block" />
              すべてお任せください
            </h1>
            <p className="mt-6 text-lg text-ink-muted max-w-2xl mx-auto">
              毎月の監査レポートには、各問題の実装代行見積もりが自動で記載されます。
              ご希望の項目をご連絡いただければ、WebMoriが安全に修正します。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://line.me/R/ti/p/@webmori"
                className="inline-flex items-center justify-center rounded-lg bg-[#06C755] px-6 py-3 text-sm font-semibold text-white hover:bg-[#05b34c] transition-colors"
              >
                LINEで相談する
              </a>
              <a
                href="mailto:hello@webmori.jp"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-ink hover:bg-surface-raised transition-colors"
              >
                メールで問い合わせ
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Three tier cards */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink sm:text-4xl mb-12">
              3つの実装オプション
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <Card className={`border-l-4 ${tier.accent} flex flex-col h-full`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${tier.accentText}`}>
                      {tier.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold text-ink">
                    {tier.price}
                    <span className="text-base font-normal text-ink-muted">{tier.unit}</span>
                  </p>
                  <p className="text-xs text-ink-muted mb-4 h-4">{tier.sub}</p>
                  <p className="text-sm text-ink-muted mb-5">{tier.description}</p>
                  <ul className="mt-auto space-y-2">
                    {tier.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-ink">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.accentText}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-raised py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink mb-12">ご利用の流れ</h2>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {step.num}
                  </div>
                  <h3 className="text-base font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PR merge special */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-xl px-6">
          <ScrollReveal>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-ink mb-2">
                自動修正PR、そのままマージできますか？
              </h3>
              <p className="text-sm text-ink-muted mb-4">
                監査で自動生成されたPRをステージング→本番へ適用する作業もお任せいただけます。
              </p>
              <p className="text-2xl font-bold text-ink">
                ¥5,000{" "}
                <span className="text-sm font-normal text-ink-muted">固定（1PRあたり）</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-raised py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink mb-10">よくある質問</h2>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border bg-surface p-6">
                  <p className="font-semibold text-ink mb-2">{faq.q}</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{faq.a}</p>
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
              まずは月次監査プランをお試しください
            </h2>
            <p className="text-white/70 mb-8">
              実装代行は月次監査プランのオプションです。監査レポートを受け取ってから、必要な修正だけご依頼いただけます。
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
