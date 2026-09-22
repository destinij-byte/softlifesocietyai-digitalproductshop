export function SkeletonGrid({ count = 8, gridClassName = "grid-products" }: { count?: number; gridClassName?: string }) {
  return (
    <div className={`grid ${gridClassName}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
