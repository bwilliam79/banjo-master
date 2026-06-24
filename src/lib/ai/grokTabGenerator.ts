/**
 * Client-side Grok-powered tab generation (Task 2.1)
 *
 * This runs entirely in the browser.
 * It expects to be called from within a context where Grok (via Hermes) is available.
 *
 * For the current implementation:
 * - In the BanjoMaster app, this can use a provided Grok API key from user settings (future)
 * - Or the user can generate via the Hermes agent and paste the result
 *
 * The function signature is designed so it can later call the xAI Grok API directly
 * when an API key is supplied, or delegate to the host Hermes session.
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
 * Main entry point for URL → Beginner tab generation using Grok.
 * 
 * Current behavior (MVP): Returns a placeholder that tells the user
 * to use the Hermes/Grok agent for generation.
 *
 * Future: Direct xAI API call when user provides key in Settings.
 */
export async function generateTabFromUrl(
  options: GenerateTabOptions
): Promise<GenerateTabResult> {
  const { url, style = 'three-finger' } = options;

  // Basic URL validation
  if (!url || (!url.includes('youtube') && !url.includes('spotify'))) {
    throw new Error('Please provide a valid YouTube or Spotify URL');
  }

  // TODO (Phase 2): Actual Grok call
  // For now we return a helpful stub so the UI flow can be built and tested.
  // The real implementation will construct a detailed prompt like:
  //
  // "You are an expert 5-string banjo arranger in Open G tuning (gDGBD).
  // Analyze this YouTube/Spotify link: ${url}
  // Style preference: ${style}
  // Generate ONLY a clean Beginner (Level 1) tablature in this exact JSON format..."
  //
  // Then parse the response into Tab shape.

  // Placeholder response for development / demo
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
    notes: `This is a placeholder. In the final version, Grok will analyze "${url}" and generate a real Beginner arrangement in ${style} style.`,
  };
}

/**
 * Helper to "level up" an existing tab (Beginner → Intermediate or higher).
 * Will also use Grok.
 */
export async function levelUpTab(
  existingTab: Tab,
  fromLevel: 1 | 2,
  targetLevel: 2 | 3
): Promise<Tab> {
  // Placeholder for now
  return {
    ...existingTab,
    id: `leveled-${existingTab.id}-${targetLevel}`,
    title: `${existingTab.title} (Level ${targetLevel})`,
  };
}
