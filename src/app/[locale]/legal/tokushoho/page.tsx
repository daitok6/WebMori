export async function generateMetadata() {
  return {
    title: "特定商取引法に基づく表記 | WebMori",
  };
}

export default async function TokushohoPage() {
  return (
    <main className="bg-white pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold text-navy-dark">
          特定商取引法に基づく表記
        </h1>
        <p className="mt-2 text-sm text-text-muted">最終更新日：2026年3月18日</p>

        <div className="mt-10">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {[
                ["販売事業者名", "WebMori（ウェブ守り）"],
                ["運営責任者", "小島 大人"],
                ["所在地", "東京都（住所は請求があった場合に遅滞なく開示いたします）"],
                ["電話番号", "請求があった場合に遅滞なく開示いたします"],
                ["メールアドレス", "support@webmori.jp"],
                ["お問い合わせ", "support@webmori.jp またはお問い合わせページよりご連絡ください"],
                ["販売価格", "Starter ¥19,800/月、Growth ¥39,800/月、Pro ¥69,800/月（税込）"],
                ["追加費用", "Growth オンボーディング ¥30,000、Pro オンボーディング ¥50,000（税込・初回のみ）"],
                ["支払方法", "クレジットカード（Visa、Mastercard、American Express、JCB）"],
                ["支払時期", "月額プラン：毎月自動更新。年額プラン：年に1回請求"],
                ["サービス提供時期", "決済完了後、即時ご利用いただけます"],
                ["返品・返金", "デジタルサービスの性質上、原則として返金はいたしません。ただし、当社の責に帰すべき事由による場合はこの限りではありません"],
                ["動作環境", "最新版のChrome、Firefox、Safari、Edgeに対応"],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border">
                  <th className="py-4 pr-6 text-left font-medium text-navy-dark align-top w-40 whitespace-nowrap">
                    {label}
                  </th>
                  <td className="py-4 text-text-body">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
