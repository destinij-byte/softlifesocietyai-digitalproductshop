// Stroke-based line icons, one consistent style, replacing emoji as primary
// marketing-site iconography - emoji reads as playful/app-casual, not the
// luxury-society tone the brand wants. 24px grid, 1.5px stroke, no fill.
import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBloom(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8C12 6 10 4 12 2c2 2 0 4 0 7.8ZM12 14.2C12 18 10 20 12 22c2-2 0-4 0-7.8ZM14.2 12C18 12 20 10 22 12c-2 2-4 0-7.8 0ZM9.8 12C6 12 4 10 2 12c2 2 4 0 7.8 0Z" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconCoin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="7" rx="8" ry="3.2" />
      <path d="M4 7v10c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2V7" />
      <path d="M4 12.3c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2" />
    </svg>
  );
}

export function IconCrown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5l3.6 3 5.4-6.5 5.4 6.5 3.6-3-1.8 9.5H4.8L3 8.5Z" />
      <path d="M6 21h12" />
    </svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.5S3 15 3 8.8C3 5.6 5.4 3.5 8 3.5c1.8 0 3.3 1 4 2.4.7-1.4 2.2-2.4 4-2.4 2.6 0 5 2.1 5 5.3 0 6.2-9 11.7-9 11.7Z" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5c3 3.2 1 5 2.3 7 1-1 1.2-2 1.2-2 2 2 2.5 4.3 2.5 6 0 3.6-3.6 6.5-8 6.5S2 17.1 2 13.5c0-3.6 2.5-6 3.7-9.2.6 1.2 1.6 2 1.6 2-.6-1.8 0-2.8 1-3.8.3 1.5 1.2 2.5 3.7 0Z" />
    </svg>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z" />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v3M12 18.5v3M4.4 4.4l2.1 2.1M17.5 17.5l2.1 2.1M2.5 12h3M18.5 12h3M4.4 19.6l2.1-2.1M17.5 6.5l2.1-2.1" />
    </svg>
  );
}

export function IconAscend(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 18 9 11l4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

export function IconKey(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="12" r="4.5" />
      <path d="M12 12h9M17 12v3.5M20 12v2.5" />
    </svg>
  );
}

export function IconBag(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}
