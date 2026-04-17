"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-2 md:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-label="BanjoMaster"
        >
          <circle cx="7" cy="17" r="5" />
          <circle cx="7" cy="17" r="2.5" />
          <path d="M10.5 13.5L19 5l2 2-8.5 8.5z" />
          <path d="M18 4l4 4" />
        </svg>
        <span className="font-serif text-lg font-semibold text-foreground tracking-tight">
          BanjoMaster
        </span>
      </div>

      {/* Spacer for desktop since sidebar shows the title */}
      <div className="hidden md:block" />

      <Link
        href="/settings"
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
        </svg>
      </Link>
    </header>
  );
}
