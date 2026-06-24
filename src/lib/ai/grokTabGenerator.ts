/**
 * Client-side Grok-powered tab generation (Task 2.1)
 *
 * This runs entirely in the browser.
 * The recommended flow with Hermes/Grok is:
 * 1. User clicks "Generate Grok Prompt" in the Import modal
 * 2. High-quality prompt is copied
 * 3. User pastes the link + prompt into this chat (or Grok)
 * 4. User pastes the JSON result back into the modal
 *
 * Future: direct xAI API if user adds a key in settings.
 */

import type { Tab } from '@/types/song';

export interface GenerateTabOptions {
  url: string;
  style?: 'three-finger' | 'clawhammer' | 'melodic' | 'single-string';
  targetLevel?: 1 | 2 | 3; // default Beginner (1)
}

export interface GenerateTabResult {
  tab: Tab;
  suggestedChords: string[];
  notes?: string; // AI notes about the arrangement
}

/**
 * Main entry point (kept for compatibility).
 * In current Hermes-powered setup the real work happens via buildGrokPrompt + manual paste.
 */
export async function generateTabFromUrl(
  options: GenerateTabOptions
): Promise<GenerateTabResult> {
  const { url, style = 'three-finger', targetLevel = 1 } = options;

  if (!url || (!url.includes('youtube') && !url.includes('spotify'))) {
    throw new Error('Please provide a valid YouTube or Spotify URL');
  }

  // Placeholder for direct-call future
  const placeholderTab: Tab = {
    id: `generated-${Date.now()}`,
    title: 'Generated from link (placeholder)',
    measures: [
      {
        timeSignature: [4, 4],
        notes: [
          { string: 3, fret: 0, duration: 0.5, offset: 0 },
          { string: 2, fret: 0, duration: 0.5, offset: 0.5 },
          { string: 1, fret: 0, duration: 0.5, offset: 1 },
          { string: 5, fret: 0, duration: 0.5, offset: 1.5 },
        ],
      },
    ],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    tempo: 110,
  };

  return {
    tab: placeholderTab,
    suggestedChords: ['G', 'C', 'D'],
    notes: `Placeholder. Use the Import modal to get a real Grok-generated Level ${targetLevel} tab for ${url}.`,
  };
}

/**
 * Builds a high-quality, copyable prompt for Grok/Hermes.
 * Optimized for reliable JSON output in banjo tablature format.
 */
export function buildGrokPrompt(options: GenerateTabOptions): string {
  const { url, style = 'three-finger', targetLevel = 1 } = options;

  const levelDesc = {
    1: 'Beginner: very simple melody using mostly open strings and first-position notes. Steady quarter and eighth notes. Very few (or no) techniques. Low note density. Easy to play at moderate tempo.',
    2: 'Intermediate: adds hammer-ons, pull-offs, basic rolls, light syncopation, and some chordal picking. Still very playable, good learning step.',
    3: 'Advanced: full Scruggs-style rolls, syncopation, melodic variations, up-the-neck playing, more complex techniques, higher note density.',
  }[targetLevel];

  return `You are an expert 5-string banjo arranger in Open G tuning (gDGBD).

Task:
Analyze the audio / video from this link and create an accurate, playable ${targetLevel === 1 ? 'Beginner' : targetLevel === 2 ? 'Intermediate' : 'Advanced'} 5-string banjo tablature.

Link: ${url}
Style preference: ${style}
Target level: ${targetLevel} — ${levelDesc}

Output ONLY valid JSON in exactly this shape (no extra text, no markdown code fences):

{
  "tab": {
    "id": "tab-xxx",
    "title": "Song Title - Level ${targetLevel}",
    "tuning": ["G", "D", "G", "B", "D"],
    "tempo": 105,
    "measures": [
      {
        "timeSignature": [4, 4],
        "notes": [
          { "string": 3, "fret": 0, "duration": 0.5, "offset": 0 },
          { "string": 2, "fret": 1, "duration": 0.5, "offset": 0.5 }
        ]
      }
    ]
  },
  "suggestedChords": ["G", "C", "D"],
  "notes": "Very short description of what this arrangement covers and why it is appropriate for Level ${targetLevel}."
}

Strict rules:
- Use realistic banjo positions for the requested level.
- Only include techniques (hammer-on, pull-off, slide, bend, choke) when they fit the target level.
- Duration and offset must be in beats (0.25, 0.5, 1.0 etc.).
- String numbers are 1 (highest) to 5 (lowest).
- Keep the tab to a reasonable length (one verse/chorus is perfect).
- Make the title descriptive.

Generate the JSON now.`;
}

/**
 * Helper to parse a pasted Grok/Hermes response into our expected shape.
 */
export function parseGrokTabResponse(raw: string): GenerateTabResult {
  let text = raw.trim();

  // Remove markdown code fences if present
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) text = codeMatch[1].trim();

  const parsed = JSON.parse(text);

  let tab: Tab;
  let suggestedChords: string[] = [];
  let notes = '';

  if (parsed.tab && typeof parsed.tab === 'object') {
    tab = parsed.tab as Tab;
    suggestedChords = parsed.suggestedChords || [];
    notes = parsed.notes || parsed.description || '';
  } else if (parsed.measures && Array.isArray(parsed.measures)) {
    tab = {
      id: parsed.id || `imported-${Date.now()}`,
      title: parsed.title || 'Imported Arrangement',
      measures: parsed.measures,
      tuning: parsed.tuning || ['G', 'D', 'G', 'B', 'D'],
      tempo: parsed.tempo || 110,
      capo: parsed.capo,
    };
    suggestedChords = parsed.suggestedChords || parsed.chordsUsed || [];
    notes = parsed.notes || parsed.description || '';
  } else {
    throw new Error('Unrecognized JSON shape. Need either { tab: {...} } or a direct Tab object with measures.');
  }

  if (!tab.measures || tab.measures.length === 0) {
    throw new Error('Parsed tab has no measures');
  }

  return { tab, suggestedChords, notes };
}

/**
 * Level-up helper (placeholder that can be wired to Grok later).
 */
export async function levelUpTab(
  existingTab: Tab,
  fromLevel: 1 | 2,
  targetLevel: 2 | 3
): Promise<Tab> {
  // For now returns a slightly modified copy.
  // Real version will send the tab + level-up instructions to Grok.
  return {
    ...existingTab,
    id: `leveled-${existingTab.id}-${targetLevel}`,
    title: `${existingTab.title} (Level ${targetLevel})`,
  };
}
