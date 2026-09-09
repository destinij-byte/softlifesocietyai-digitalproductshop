
interface MembershipBadgeProps {
  badge: string;
  founding?: boolean;
}

export function MembershipBadge({ badge, founding }: MembershipBadgeProps) {
  return <span className={`pill pill-gold ${founding ? "badge-founding" : ""}`}>{badge}</span>;
}
