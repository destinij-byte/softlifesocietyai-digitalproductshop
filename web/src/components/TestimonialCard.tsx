import { StarRating } from "./StarRating";
import type { Testimonial } from "../data/testimonials";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { headline, quote, name, rating, photoUrl } = testimonial;

  return (
    <figure className="card card-hover testimonial-card">
      <span className="testimonial-quote-mark" aria-hidden="true">
        &ldquo;
      </span>
      <StarRating rating={rating} size={15} />
      <h3 className="testimonial-headline">{headline}</h3>
      <blockquote className="testimonial-quote">
        <p>{quote}</p>
      </blockquote>
      <figcaption className="testimonial-attribution">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="testimonial-avatar" />
        ) : (
          <span className="testimonial-avatar testimonial-avatar-initials" aria-hidden="true">
            {initials(name)}
          </span>
        )}
        <span className="testimonial-name">{name}</span>
      </figcaption>
    </figure>
  );
}
