export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: size, color: n <= Math.round(rating) ? "var(--gold)" : "var(--blush)" }}>
          ★
        </span>
      ))}
    </span>
  );
}
