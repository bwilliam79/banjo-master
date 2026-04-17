"use client";

import Link from "next/link";

const quickActions = [
  {
    title: "Chords",
    description: "Browse and learn banjo chord shapes",
    href: "/chords",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Songs",
    description: "Learn your favorite songs with tabs",
    href: "/songs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    title: "Practice",
    description: "Track your practice sessions and progress",
    href: "/practice",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Tools",
    description: "Metronome, tuner, and more",
    href: "/tools",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <section className="mb-10">
        <p className="font-hand text-xl text-primary mb-1">
          Welcome back,
        </p>
        <h1 className="font-serif text-4xl font-semibold text-foreground mb-2 tracking-tight">
          Pick up where you left off.
        </h1>
        <p className="text-secondary text-base">
          Your personal companion for learning and mastering the banjo.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
          Where to next?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-surface rounded-2xl p-6 border border-border cursor-pointer hover:border-primary/40 hover:bg-surface-hover transition-colors duration-200 group"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="text-primary mb-3 group-hover:text-primary-dark transition-colors">
                {action.icon}
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {action.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
