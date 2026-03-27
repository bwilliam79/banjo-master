"use client";

import { useAppStore } from "@/stores/app-store";

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Customize your BanjoMaster experience.</p>
      </div>

      <section className="bg-surface rounded-xl border border-border p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Dark Mode</p>
            <p className="text-sm text-muted">
              Switch between light and dark themes.
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              darkMode ? "bg-primary" : "bg-border"
            }`}
            role="switch"
            aria-checked={darkMode}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
