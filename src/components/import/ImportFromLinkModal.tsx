'use client';

import React, { useState } from 'react';
import TabViewer from '@/components/tab/TabViewer';
import type { Tab, Song, Arrangement } from '@/types/song';
import { generateTabFromUrl, buildGrokPrompt } from '@/lib/ai/grokTabGenerator';

interface ImportFromLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongCreated: (song: Song) => void;
}

const STYLES: Array<Song['style']> = ['three-finger', 'clawhammer', 'melodic', 'single-string'];
const STYLE_LABELS: Record<Song['style'], string> = {
  'three-finger': 'Three-Finger',
  clawhammer: 'Clawhammer',
  melodic: 'Melodic',
  'single-string': 'Single-String',
};

const LEVELS: Array<1 | 2 | 3> = [1, 2, 3];
const LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
} as const;

export default function ImportFromLinkModal({
  isOpen,
  onClose,
  onSongCreated,
}: ImportFromLinkModalProps) {
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState<Song['style']>('three-finger');
  const [targetLevel, setTargetLevel] = useState<1 | 2 | 3>(1);
  const [prompt, setPrompt] = useState('');
  const [pasteResult, setPasteResult] = useState('');
  const [previewTab, setPreviewTab] = useState<Tab | null>(null);
  const [previewNotes, setPreviewNotes] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setUrl('');
    setStyle('three-finger');
    setTargetLevel(1);
    setPrompt('');
    setPasteResult('');
    setPreviewTab(null);
    setPreviewNotes('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGeneratePrompt = () => {
    if (!url.trim()) {
      setError('Please enter a YouTube or Spotify URL');
      return;
    }
    setIsGeneratingPrompt(true);
    setError('');

    try {
      const fullPrompt = buildGrokPrompt({
        url: url.trim(),
        style,
        targetLevel,
      });
      setPrompt(fullPrompt);

      // Auto-copy to clipboard for convenience
      navigator.clipboard.writeText(fullPrompt).catch(() => {});
    } catch (e: any) {
      setError(e?.message || 'Failed to build prompt');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleParsePaste = () => {
    setError('');
    setPreviewTab(null);
    setPreviewNotes('');

    if (!pasteResult.trim()) {
      setError('Paste the Grok result (JSON) first');
      return;
    }

    try {
      // Try to parse flexible JSON (sometimes Grok wraps in ```json ... ```)
      let jsonText = pasteResult.trim();
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }

      const parsed = JSON.parse(jsonText);

      // Support a few common shapes from the AI
      let tab: Tab;
      let suggestedChords: string[] = [];
      let notes = '';

      if (parsed.tab && typeof parsed.tab === 'object') {
        tab = parsed.tab as Tab;
        suggestedChords = parsed.suggestedChords || [];
        notes = parsed.notes || parsed.description || '';
      } else if (parsed.measures && Array.isArray(parsed.measures)) {
        // Direct Tab shape
        tab = {
          id: parsed.id || `imported-${Date.now()}`,
          title: parsed.title || 'Imported Arrangement',
          measures: parsed.measures,
          tuning: parsed.tuning || ['G', 'D', 'G', 'B', 'D'],
          tempo: parsed.tempo || 110,
          capo: parsed.capo,
        };
        suggestedChords = parsed.chordsUsed || parsed.suggestedChords || [];
        notes = parsed.description || '';
      } else {
        throw new Error('Unrecognized format. Expect { tab: {...} } or direct Tab object.');
      }

      // Basic validation
      if (!tab.measures || tab.measures.length === 0) {
        throw new Error('Tab must have at least one measure');
      }

      setPreviewTab(tab);
      setPreviewNotes(notes || `Level ${targetLevel} arrangement for ${url}`);

      // Store for later save
    } catch (e: any) {
      setError(`Parse error: ${e?.message || e}. Make sure you pasted valid JSON.`);
    }
  };

  const handleSave = async () => {
    if (!previewTab) {
      setError('Generate and preview a tab first');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const newSong: Song = {
        id: `imported-${Date.now()}`,
        title: previewTab.title || 'Imported from URL',
        artist: 'Imported via Grok',
        genre: 'Bluegrass',
        style,
        duration: 90,
        difficulty: targetLevel as any,
        chordsUsed: [],
        tags: ['imported', 'grok'],
        arrangements: [
          {
            id: `arr-${Date.now()}`,
            level: targetLevel,
            label: LEVEL_LABELS[targetLevel],
            description: previewNotes || `Generated Level ${targetLevel} from ${url}`,
            tab: previewTab,
          } as Arrangement,
        ],
      };

      onSongCreated(newSong);
      handleClose();
    } catch (e: any) {
      setError(`Save failed: ${e?.message || e}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Import from URL</h2>
            <p className="text-xs text-muted">YouTube or Spotify → Beginner tab via Grok</p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* URL + Options */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Link
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                Style
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      style === s
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-hover text-foreground border-border hover:bg-border'
                    }`}
                  >
                    {STYLE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                Target Level
              </label>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setTargetLevel(l)}
                    className={`flex-1 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                      targetLevel === l
                        ? 'bg-emerald-600 text-white border-transparent'
                        : 'bg-surface-hover text-foreground border-border hover:bg-border'
                    }`}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGeneratePrompt}
              disabled={isGeneratingPrompt || !url.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              {isGeneratingPrompt ? 'Building prompt...' : 'Generate Grok Prompt'}
            </button>

            {prompt && (
              <button
                onClick={copyPrompt}
                className="px-4 py-2 rounded-xl border border-border bg-surface-hover hover:bg-border text-sm font-medium"
              >
                Copy Prompt
              </button>
            )}
          </div>

          {/* Prompt display */}
          {prompt && (
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                Copy this prompt into Grok / Hermes
              </label>
              <textarea
                readOnly
                value={prompt}
                className="w-full h-32 text-xs font-mono bg-background border border-border rounded-xl p-3 resize-y"
              />
              <p className="text-[10px] text-muted mt-1">
                Paste the full JSON response from Grok below.
              </p>
            </div>
          )}

          {/* Paste result */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Paste Grok Result (JSON)
            </label>
            <textarea
              value={pasteResult}
              onChange={(e) => setPasteResult(e.target.value)}
              placeholder={`{\n  "tab": { "title": "...", "tuning": [...], "tempo": 110, "measures": [...] },\n  "suggestedChords": ["G", "C", "D"],\n  "notes": "Simple beginner version..."\n}`}
              className="w-full h-28 text-xs font-mono bg-background border border-border rounded-xl p-3 resize-y"
            />
            <button
              onClick={handleParsePaste}
              className="mt-2 px-4 py-1.5 rounded-xl border border-border hover:bg-surface-hover text-sm font-medium"
            >
              Parse & Preview
            </button>
          </div>

          {/* Preview */}
          {previewTab && (
            <div className="border border-border rounded-xl p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">{previewTab.title}</div>
                  <div className="text-xs text-muted">
                    {LEVEL_LABELS[targetLevel]} • {style}
                  </div>
                </div>
              </div>

              <div className="max-h-[220px] overflow-auto rounded-lg border border-border bg-surface p-2">
                <TabViewer tab={previewTab} />
              </div>

              {previewNotes && (
                <div className="mt-3 text-xs text-muted italic">{previewNotes}</div>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-surface/60">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm text-muted hover:text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!previewTab || isSaving}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            {isSaving ? 'Saving...' : 'Save as New Song (Level 1)'}
          </button>
        </div>
      </div>
    </div>
  );
}
