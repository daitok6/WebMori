import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJa = locale === "ja";
  return {
    title: isJa ? "プライバシーポリシー | WebMori" : "Privacy Policy | WebMori",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJa = locale === "ja";

  return (
    <main className="bg-white pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold text-navy-dark">
          {isJa ? "プライバシーポリシー" : "Privacy Policy"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {isJa ? "最終更新日：2026年3月18日" : "Last updated: March 18, 2026"}
        </p>

        <div className="mt-10 space-y-8 text-text-body leading-relaxed">
          {isJa ? (
            <>
              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">1. 事業者情報</h2>
                <p>WebMori（ウェブ守り）は、ウェブセキュリティ監査サービスを提供する事業者です。本プライバシーポリシーは、当サービスが収集・利用する個人情報の取り扱いについて説明します。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">2. 収集する情報</h2>
                <p>当サービスは以下の情報を収集します：</p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>メールアドレス（アカウント作成・認証のため）</li>
                  <li>お支払い情報（Stripeを通じて処理。当社はカード番号を保持しません）</li>
                  <li>GitHubリポジトリURL（監査対象の特定のため）</li>
                  <li>サービス利用ログ（改善目的）</li>
                  <li>お問い合わせ内容（サポート対応のため）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">3. 情報の利用目的</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>サービスの提供・運営</li>
                  <li>マジックリンクによるログイン認証</li>
                  <li>監査レポートの作成・配信</li>
                  <li>請求・決済処理</li>
                  <li>カスタマーサポート</li>
                  <li>サービス改善・不正利用の防止</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">4. 第三者への提供</h2>
                <p>当社は、以下のサービスプロバイダーに必要な範囲で情報を提供します：</p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li><strong>Stripe</strong>（決済処理）</li>
                  <li><strong>Resend</strong>（メール送信）</li>
                  <li><strong>Vercel</strong>（ホスティング・データベース）</li>
                  <li><strong>Cloudflare</strong>（ファイルストレージ）</li>
                </ul>
                <p className="mt-2">法令に基づく開示要求がある場合を除き、第三者へのデータ販売・共有は行いません。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">5. データの保持期間</h2>
                <p>アカウントデータはサービス利用中および解約後90日間保持します。お支払い履歴は法令に従い7年間保持します。削除をご希望の場合はお問い合わせください。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">6. セキュリティ</h2>
                <p>SSL/TLS暗号化、アクセス制御、定期的なセキュリティレビューにより、お客様の情報を保護します。ただし、インターネット上での完全な安全性を保証するものではありません。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">7. お客様の権利</h2>
                <p>お客様は以下の権利を有します：個人情報の開示・訂正・削除の請求、利用停止の請求。ご要望はお問い合わせページよりご連絡ください。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">8. Cookieの使用</h2>
                <p>当サービスはセッション管理のためにCookieを使用します。ブラウザの設定によりCookieを無効化できますが、一部機能が利用できなくなる場合があります。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">9. ポリシーの変更</h2>
                <p>本ポリシーを変更する場合は、このページにて通知します。重要な変更はメールでもお知らせします。</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">10. お問い合わせ</h2>
                <p>プライバシーに関するご質問は、<a href="/contact" className="text-gold hover:underline">お問い合わせページ</a>よりご連絡ください。</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">1. About Us</h2>
                <p>WebMori is a web security audit service. This Privacy Policy explains how we collect and use personal information in connection with our services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">2. Information We Collect</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email address (for account creation and authentication)</li>
                  <li>Payment information (processed via Stripe — we do not store card numbers)</li>
                  <li>GitHub repository URLs (to identify audit targets)</li>
                  <li>Service usage logs (for improvement purposes)</li>
                  <li>Inquiry content (for support purposes)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">3. How We Use Information</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Providing and operating the service</li>
                  <li>Magic link authentication</li>
                  <li>Creating and delivering audit reports</li>
                  <li>Billing and payment processing</li>
                  <li>Customer support</li>
                  <li>Service improvement and fraud prevention</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">4. Third Parties</h2>
                <p>We share data with the following service providers to the extent necessary:</p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li><strong>Stripe</strong> (payment processing)</li>
                  <li><strong>Resend</strong> (email delivery)</li>
                  <li><strong>Vercel</strong> (hosting and database)</li>
                  <li><strong>Cloudflare</strong> (file storage)</li>
                </ul>
                <p className="mt-2">We do not sell or share your data with third parties except as required by law.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">5. Data Retention</h2>
                <p>Account data is retained while your account is active and for 90 days after cancellation. Payment records are retained for 7 years as required by law. Contact us to request deletion.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">6. Security</h2>
                <p>We protect your information through SSL/TLS encryption, access controls, and regular security reviews. However, no method of transmission over the internet is 100% secure.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">7. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal data, and to request that we stop using it. Please contact us via the contact page with any requests.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">8. Cookies</h2>
                <p>We use cookies for session management. You can disable cookies in your browser settings, but some features may not work correctly.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">9. Changes to This Policy</h2>
                <p>We will notify you of changes by updating this page. Significant changes will also be communicated via email.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy-dark mb-3">10. Contact</h2>
                <p>For privacy-related questions, please reach us via our <a href="/contact" className="text-gold hover:underline">contact page</a>.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
