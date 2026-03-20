import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("legal.tokushoho");
  return { title: t("title") };
}

export default function TokushohoPage() {
  const t = useTranslations("legal.tokushoho");

  const rows: [string, string][] = t.raw("rows");

  return (
    <main className="bg-white pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold text-navy-dark">{t("title")}</h1>
        <p className="mt-2 text-sm text-text-muted">{t("lastUpdated")}</p>

        {t.has("notice") && (
          <div className="mt-6 rounded-lg bg-bg-cream border border-border-light p-4 text-sm text-text-muted">
            {t("notice")}
          </div>
        )}

        <div className="mt-10">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {rows.map(([label, value]) => (
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
