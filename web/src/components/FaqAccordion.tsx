import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div className="faq-item" key={item.question}>
            <button
              className="faq-question"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              <span>{item.question}</span>
              <svg
                className={`faq-chevron ${open ? "open" : ""}`}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={`faq-answer ${open ? "open" : ""}`}>
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
