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

export default function ToolsPage() {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Tools</h1>
      <p className="text-muted text-sm mb-6">
        Utilities to help you play and practice.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-surface rounded-xl p-6 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-foreground mb-1">
              {tool.title}
            </h3>
            <p className="text-muted text-sm">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
