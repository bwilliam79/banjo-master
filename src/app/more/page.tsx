import Link from "next/link";

const tools = [
  {
    title: "Metronome",
    description: "Keep time with an adjustable metronome",
    href: "/tools/metronome",
  },
  {
    title: "Tuner",
    description: "Tune your banjo with a chromatic tuner",
    href: "/tools/tuner",
  },
  {
    title: "Hand Position Camera",
    description: "Use your camera to check hand placement while playing",
    href: "/tools/camera",
  },
];

export default function MorePage() {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">More</h1>
        <p className="text-muted text-sm mt-1">Tools and settings.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Tools
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-surface rounded-xl p-5 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-foreground mb-0.5">{tool.title}</h3>
              <p className="text-muted text-sm">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Settings
        </h2>
        <Link
          href="/settings"
          className="block bg-surface rounded-xl p-5 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-foreground mb-0.5">Settings</h3>
          <p className="text-muted text-sm">
            Appearance, dark mode, and app version.
          </p>
        </Link>
      </section>
    </div>
  );
}
