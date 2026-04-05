import { ReviewQueue } from "@/components/admin/review-queue";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Review Queue</h1>
        <p className="text-sm text-ink-muted mt-1">
          Audit reports awaiting operator review before client delivery.
        </p>
      </div>
      <ReviewQueue />
    </div>
  );
}
