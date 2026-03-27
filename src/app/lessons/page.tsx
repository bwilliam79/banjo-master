'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import type { Lesson } from '@/types/lesson';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-amber-100 text-amber-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function LessonsPage() {
  useEffect(() => {
    seedDatabase();
  }, []);

  const lessons = useLiveQuery(() => db.lessons.orderBy('order').toArray(), []);
  const progress = useLiveQuery(() => db.userProgress.get('singleton'), []);

  const completedIds = new Set(progress?.completedLessonIds ?? []);

  // Group lessons by module
  const modules: { moduleId: string; moduleName: string; lessons: Lesson[] }[] = [];
  const moduleMap = new Map<string, Lesson[]>();
  const moduleNames = new Map<string, string>();

  for (const lesson of lessons ?? []) {
    if (!moduleMap.has(lesson.moduleId)) {
      moduleMap.set(lesson.moduleId, []);
      moduleNames.set(lesson.moduleId, lesson.moduleName);
    }
    moduleMap.get(lesson.moduleId)!.push(lesson);
  }

  for (const [moduleId, moduleLessons] of moduleMap) {
    modules.push({
      moduleId,
      moduleName: moduleNames.get(moduleId) ?? moduleId,
      lessons: moduleLessons.sort((a, b) => a.order - b.order),
    });
  }

  if (!lessons) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
          <p className="text-sm text-muted mt-1">
            {completedIds.size} of {lessons.length} completed
          </p>
        </div>

        {modules.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted">No lessons available yet.</div>
          </div>
        ) : (
          <div className="space-y-8">
            {modules.map((mod) => {
              const moduleCompleted = mod.lessons.filter((l) => completedIds.has(l.id)).length;
              return (
                <section key={mod.moduleId}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">{mod.moduleName}</h2>
                    <span className="text-xs text-muted">
                      {moduleCompleted}/{mod.lessons.length} done
                    </span>
                  </div>
                  <div className="space-y-3">
                    {mod.lessons.map((lesson) => {
                      const isCompleted = completedIds.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}`}
                          className="block bg-surface rounded-xl p-4 border border-border hover:bg-surface-hover transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-surface-hover text-muted'
                              }`}
                            >
                              {isCompleted ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                lesson.order
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-foreground truncate">
                                  {lesson.title}
                                </h3>
                                <span
                                  className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${levelColors[lesson.level]}`}
                                >
                                  {lesson.level}
                                </span>
                              </div>
                              <p className="text-xs text-muted line-clamp-2">{lesson.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted">
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
                            <svg className="shrink-0 text-muted mt-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
