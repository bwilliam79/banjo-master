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
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome to BanjoMaster
        </h1>
        <p className="text-muted text-sm">
          Your personal companion for learning and mastering the banjo.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-surface rounded-xl p-6 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="text-primary mb-3 group-hover:text-primary-light transition-colors">
                {action.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {action.title}
              </h3>
              <p className="text-muted text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
