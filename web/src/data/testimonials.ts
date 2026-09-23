// Launch-site testimonials. These are sample/placeholder testimonials, not
// verified customer reviews - swap in real names, photos, and quotes here as
// they come in. (The real, verified per-product review system lives on
// ProductDetailPage/vaultApi and is unrelated to this file.)
export interface Testimonial {
  id: string;
  headline: string;
  quote: string;
  name: string;
  rating: number;
  photoUrl?: string;
  tags?: string[];
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "jasmine-r",
    headline: "It finally feels personal.",
    quote:
      "I've tried so many planners and self-improvement apps, but Soft Life Society feels completely different. I love that everything is centered around the version of myself I'm actually trying to become. It makes working on my goals feel exciting instead of overwhelming.",
    name: "Jasmine R.",
    rating: 5,
  },
  {
    id: "aaliyah-m",
    headline: "My new favorite daily check-in.",
    quote:
      "The personalized affirmations and manifestations are my favorite part. They actually feel relevant to what I'm going through instead of sounding like random quotes from Pinterest. I look forward to checking in every morning.",
    name: "Aaliyah M.",
    rating: 5,
  },
  {
    id: "brianna-t",
    headline: "I'm finally being consistent.",
    quote:
      "Soft Life Society helped me stop trying to change everything overnight. Having my goals, routines, mindset, self-care, and wellness all in one place makes it so much easier to stay consistent.",
    name: "Brianna T.",
    rating: 5,
  },
  {
    id: "nia-k",
    headline: "It feels like my digital big sister.",
    quote:
      "The AI guidance is what really sold me. It feels like having someone help me organize my thoughts and figure out my next step when I'm feeling stuck. I've already started approaching my goals differently.",
    name: "Nia K.",
    rating: 5,
  },
  {
    id: "camille-d",
    headline: "My reset actually became a lifestyle.",
    quote:
      "I downloaded Soft Life Society because I wanted a reset, but it became so much more than that. I'm more intentional about my mornings, my goals, my money, and how I take care of myself. It's giving ‘becoming her’ for real.",
    name: "Camille D.",
    rating: 5,
  },
  {
    id: "taylor-s",
    headline: "Everything I need in one place.",
    quote:
      "I used to have a notes app for goals, another app for habits, Pinterest boards for inspiration, and random reminders everywhere. Having everything together makes my life feel so much more organized.",
    name: "Taylor S.",
    rating: 5,
  },
  {
    id: "maya-j",
    headline: "The energy is EVERYTHING.",
    quote:
      "I love how feminine and motivating the whole experience feels. It doesn't make personal growth feel like punishment or another thing on my to-do list. It makes me actually want to show up for myself.",
    name: "Maya J.",
    rating: 5,
  },
  {
    id: "destiny-w",
    headline: "I started taking my goals seriously.",
    quote:
      "There's something about seeing your goals and future self laid out in front of you that changes your mindset. Soft Life Society has helped me get clearer about the woman I want to become and the habits I need to build to get there.",
    name: "Destiny W.",
    rating: 5,
  },
  {
    id: "kendra-l",
    headline: "My soft life has structure now.",
    quote:
      "I used to think a soft life meant doing less. Now I see it as creating a life that actually supports me. This app helps me stay accountable while still making self-care, confidence, and enjoying my life part of the process.",
    name: "Kendra L.",
    rating: 5,
  },
  {
    id: "monique-a",
    headline: "It feels like a whole lifestyle, not just an app.",
    quote:
      "Soft Life Society combines everything I've been looking for—mindset, wellness, confidence, organization, goals, and personal growth. It feels like a space designed for women who are intentionally creating a better life for themselves.",
    name: "Monique A.",
    rating: 5,
  },
];
