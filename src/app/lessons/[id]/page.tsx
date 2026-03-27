'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import type { Lesson, LessonContent } from '@/types/lesson';

function renderContent(block: LessonContent, index: number) {
  switch (block.type) {
    case 'text':
      return (
        <div key={index} className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {block.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    case 'chord-diagram':
      return (
        <div key={index} className="bg-surface-hover rounded-lg p-4 text-center">
          <span className="text-xs text-muted uppercase tracking-wide">Chord</span>
          <p className="text-lg font-bold text-primary mt-1">{block.content}</p>
        </div>
      );
    case 'tab':
      return (
        <div key={index} className="bg-surface-hover rounded-lg p-4">
          <span className="text-xs text-muted uppercase tracking-wide">Tablature</span>
          <pre className="text-xs font-mono text-foreground mt-2 overflow-x-auto">{block.content}</pre>
        </div>
      );
    case 'video':
      return (
        <div key={index} className="bg-surface-hover rounded-lg p-4 text-center">
          <span className="text-xs text-muted uppercase tracking-wide">Video</span>
          <p className="text-sm text-primary mt-1">{block.content}</p>
        </div>
      );
    case 'exercise':
      return (
        <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <span className="text-xs text-amber-700 uppercase tracking-wide font-medium">Exercise</span>
          <p className="text-sm text-foreground mt-1">{block.content}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  useEffect(() => {
    seedDatabase();
  }, []);

  const lesson = useLiveQuery(() => db.lessons.get(lessonId), [lessonId]);
  const progress = useLiveQuery(() => db.userProgress.get('singleton'), []);

  const isCompleted = progress?.completedLessonIds?.includes(lessonId) ?? false;

  const toggleComplete = useCallback(async () => {
    const current = await db.userProgress.get('singleton');
    if (!current) return;

    const ids = current.completedLessonIds ?? [];
    if (ids.includes(lessonId)) {
      await db.userProgress.update('singleton', {
        completedLessonIds: ids.filter((id) => id !== lessonId),
      });
    } else {
      await db.userProgress.update('singleton', {
        completedLessonIds: [...ids, lessonId],
      });
    }
  }, [lessonId]);

  if (lesson === undefined || progress === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading lesson...</div>
      </div>
    );
  }

  if (lesson === null || lesson === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => router.push('/lessons')}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Lessons
        </button>
        <div className="text-center text-muted py-20">Lesson not found.</div>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-amber-100 text-amber-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push('/lessons')}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Lessons
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted">{lesson.moduleName}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${levelColors[lesson.level]}`}>
              {lesson.level}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          <p className="text-sm text-muted mt-1">{lesson.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {lesson.estimatedMinutes} min
            </span>
            <span>{lesson.exercises.length} exercise{lesson.exercises.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Learning Objectives</h2>
          <ul className="space-y-2">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 mt-0.5 text-muted">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    {isCompleted && <polyline points="8 12 11 15 16 9" />}
                  </svg>
                </span>
                <span className="text-foreground">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content blocks */}
        <div className="space-y-4 mb-6">
          {lesson.content.map((block, i) => renderContent(block, i))}
        </div>

        {/* Exercises */}
        {lesson.exercises.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-3">Exercises</h2>
            <div className="space-y-3">
              {lesson.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-surface rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {exercise.type.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-muted">
                      Passing score: {exercise.passingScore}%
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{exercise.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark Complete button */}
        <div className="sticky bottom-20 md:bottom-4 pb-4">
          <button
            type="button"
            onClick={toggleComplete}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
              isCompleted
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isCompleted ? 'Completed - Mark Incomplete' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
