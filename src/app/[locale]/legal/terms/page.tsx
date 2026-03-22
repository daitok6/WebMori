export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJa = locale === "ja";
  return {
    title: isJa ? "利用規約 | WebMori" : "Terms of Service | WebMori",
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJa = locale === "ja";

  return (
    <main className="bg-surface pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold text-ink">
          {isJa ? "利用規約" : "Terms of Service"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {isJa ? "最終更新日：2026年3月18日" : "Last updated: March 18, 2026"}
        </p>

        <div className="mt-10 space-y-8 text-ink leading-relaxed">
          {isJa ? (
            <>
              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第1条（適用）</h2>
                <p>本利用規約（以下「本規約」）は、WebMori（ウェブ守り）（以下「当社」）が提供するウェブセキュリティ監査サービス（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意した上で本サービスをご利用ください。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第2条（利用登録）</h2>
                <p>本サービスの利用を希望する方は、当社所定の方法により利用登録を申請し、当社がこれを承認することによって、利用登録が完了します。当社は以下の場合に利用登録を拒否することがあります：</p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>虚偽の情報を申請した場合</li>
                  <li>過去に本規約に違反したことがある場合</li>
                  <li>その他当社が不適切と判断した場合</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第3条（料金・支払い）</h2>
                <p>本サービスの利用料金は当社が定める金額とし、Stripeを通じて決済します。月額プランは毎月自動更新され、年額プランは年に1回請求されます。料金の変更がある場合は30日前に通知します。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第4条（解約・返金）</h2>
                <p>月額プランはいつでも解約可能です。解約後は当該請求期間の終了まで本サービスをご利用いただけます。既払いの料金は原則として返金いたしません。ただし、サービス障害等、当社の責に帰すべき事由による場合はこの限りではありません。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第5条（禁止事項）</h2>
                <p>利用者は以下の行為を行ってはなりません：</p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>法令または本規約に違反する行為</li>
                  <li>不正アクセスや第三者のリポジトリの無断登録</li>
                  <li>当社サービスの逆コンパイル・リバースエンジニアリング</li>
                  <li>当社の知的財産権を侵害する行為</li>
                  <li>その他当社が不適切と判断する行為</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第6条（知的財産権）</h2>
                <p>本サービスおよび監査レポートに含まれる著作権その他の知的財産権は当社に帰属します。利用者は、業務上の利用（社内共有・改善実施等）の範囲でレポートを使用することができます。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第7条（免責事項）</h2>
                <p>当社は本サービスによる監査が全ての脆弱性・問題を発見することを保証しません。当社の提案に基づく修正の実施はお客様の判断・責任において行われます。当社の賠償責任は、当該月の利用料金を上限とします。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第8条（サービスの変更・停止）</h2>
                <p>当社はサービス内容を予告なく変更・停止することがあります。重要な変更については事前に通知します。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第9条（準拠法・管轄）</h2>
                <p>本規約は日本法に準拠します。本サービスに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">第10条（お問い合わせ）</h2>
                <p>本規約に関するお問い合わせは、<a href="/contact" className="text-primary hover:underline">お問い合わせページ</a>よりご連絡ください。</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">1. Acceptance of Terms</h2>
                <p>These Terms of Service ("Terms") govern your use of the WebMori web security audit service ("Service") provided by WebMori ("we", "us"). By using the Service, you agree to these Terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">2. Account Registration</h2>
                <p>To use the Service, you must register for an account. We may refuse registration if you provide false information, have previously violated these Terms, or for other reasons we deem appropriate.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">3. Fees and Payment</h2>
                <p>Service fees are as listed on our pricing page and are processed via Stripe. Monthly plans renew automatically each month; annual plans are billed once per year. We will notify you 30 days in advance of any price changes.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">4. Cancellation and Refunds</h2>
                <p>Monthly plans can be cancelled at any time. Upon cancellation, you retain access until the end of the current billing period. Fees already paid are non-refundable except in cases of service failure attributable to us.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">5. Prohibited Activities</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violating applicable laws or these Terms</li>
                  <li>Unauthorized access or registering repositories you don't own</li>
                  <li>Decompiling or reverse-engineering our service</li>
                  <li>Infringing our intellectual property rights</li>
                  <li>Any activity we deem inappropriate</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">6. Intellectual Property</h2>
                <p>All intellectual property rights in the Service and audit reports belong to us. You may use reports for internal business purposes (sharing within your organization, implementing fixes, etc.).</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">7. Disclaimer</h2>
                <p>We do not guarantee that our audits will identify all vulnerabilities or issues. Implementing our recommendations is done at your own discretion and risk. Our liability is limited to the fees paid for the month in which the issue arose.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">8. Service Changes</h2>
                <p>We may modify or discontinue the Service at any time. We will provide advance notice of significant changes.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">9. Governing Law</h2>
                <p>These Terms are governed by the laws of Japan. Any disputes shall be subject to the exclusive jurisdiction of the Tokyo District Court.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-ink mb-3">10. Contact</h2>
                <p>For questions about these Terms, please reach us via our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
