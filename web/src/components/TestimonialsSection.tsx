import { useRef } from "react";

import { TESTIMONIALS } from "../data/testimonials";
import { TestimonialCard } from "./TestimonialCard";

// A lightweight, dependency-free carousel: native horizontal scroll with
// scroll-snap, driven by prev/next buttons (and, on touch devices, a swipe).
// No autoplay - the brief is explicit that this should never be distracting.
export function TestimonialsSection() {
  const trackRef = useRef<HTMLUListElement>(null);

  function scrollByCards(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".testimonial-slide");
    const amount = card ? card.offsetWidth + 20 : track.offsetWidth * 0.85;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCards(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCards(-1);
    }
  }

  return (
    <section className="section" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="section-head">
          <h2 id="testimonials-heading">What the Soft Life Society is saying</h2>
          <p className="muted" style={{ marginTop: 14, fontSize: 15.5 }}>
            Real growth. Intentional living. Becoming her.
          </p>
        </div>

        <div className="testimonials-carousel">
          <button
            type="button"
            className="testimonials-nav testimonials-nav-prev"
            aria-label="Previous testimonials"
            onClick={() => scrollByCards(-1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <ul
            className="testimonials-track"
            ref={trackRef}
            aria-label="Customer testimonials"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {TESTIMONIALS.map((testimonial) => (
              <li className="testimonial-slide" key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="testimonials-nav testimonials-nav-next"
            aria-label="Next testimonials"
            onClick={() => scrollByCards(1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
