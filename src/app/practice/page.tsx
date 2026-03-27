'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import { generateRecommendations } from '@/lib/recommendations/engine';
import RecommendationCards from '@/components/practice/RecommendationCards';
import PracticeTimer from '@/components/practice/PracticeTimer';
import StreakCalendar from '@/components/practice/StreakCalendar';

export default function PracticePage() {
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    seedDatabase();
  }, []);

  const progress = useLiveQuery(() => db.userProgress.get('singleton'), []);
  const sessions = useLiveQuery(
    () => db.practiceSessions.orderBy('startedAt').reverse().limit(10).toArray(),
    []
  );
  const allSessions = useLiveQuery(
    () => db.practiceSessions.toArray(),
    []
  );
  const songs = useLiveQuery(() => db.songs.toArray(), []);

  const recommendations =
    progress && songs
      ? generateRecommendations(progress, progress.completedLessonIds ?? [], songs)
      : [];

  if (progress === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  const skillEntries = progress
    ? (Object.entries(progress.skillLevels) as [string, number][])
    : [];
  const dailyGoal = progress?.preferences?.dailyGoalMinutes ?? 15;
  const todayMinutes = progress?.totalPracticeMinutes ?? 0;
  const goalProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Practice</h1>
          <p className="text-sm text-muted mt-1">
            Track your practice sessions and build consistency.
          </p>
        </div>

        {/* Recommendation cards */}
        <RecommendationCards recommendations={recommendations} />

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-xs text-muted mb-1">Current Streak</div>
            <div className="text-2xl font-bold text-primary">
              {progress?.currentStreak ?? 0}
              <span className="text-sm font-normal text-muted ml-1">days</span>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-xs text-muted mb-1">Longest Streak</div>
            <div className="text-2xl font-bold text-foreground">
              {progress?.longestStreak ?? 0}
              <span className="text-sm font-normal text-muted ml-1">days</span>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-xs text-muted mb-1">Total Practice</div>
            <div className="text-2xl font-bold text-foreground">
              {progress?.totalPracticeMinutes ?? 0}
              <span className="text-sm font-normal text-muted ml-1">min</span>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-xs text-muted mb-1">Lessons Done</div>
            <div className="text-2xl font-bold text-foreground">
              {progress?.completedLessonIds?.length ?? 0}
            </div>
          </div>
        </div>

        {/* Streak calendar */}
        <StreakCalendar sessions={allSessions ?? []} />

        {/* Daily goal */}
        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Daily Goal</span>
            <span className="text-xs text-muted">
              {todayMinutes} / {dailyGoal} min
            </span>
          </div>
          <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${goalProgress}%`,
                backgroundColor: goalProgress >= 100 ? '#16a34a' : '#b45309',
              }}
            />
          </div>
          {goalProgress >= 100 && (
            <p className="text-xs text-green-700 mt-2 font-medium">Goal reached! Great work.</p>
          )}
        </div>

        {/* Skill levels */}
        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Skill Levels</h2>
          <div className="space-y-3">
            {skillEntries.map(([skill, level]) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground capitalize">{skill}</span>
                  <span className="text-xs text-muted">{level}/100</span>
                </div>
                <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice timer / start button */}
        {showTimer ? (
          <PracticeTimer onStop={() => setShowTimer(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowTimer(true)}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors mb-6"
          >
            Start Practice Session
          </button>
        )}

        {/* Recent sessions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h2>
          {!sessions || sessions.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-6 text-center text-sm text-muted">
              No practice sessions yet. Start your first session!
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const date = new Date(session.startedAt);
                const mins = Math.round(session.durationSeconds / 60);
                return (
                  <div
                    key={session.id}
                    className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {date.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {session.activities.length} activit{session.activities.length !== 1 ? 'ies' : 'y'}
                        {session.notes ? ` - ${session.notes}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">{mins} min</div>
                      <div className="text-xs text-muted">
                        {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
