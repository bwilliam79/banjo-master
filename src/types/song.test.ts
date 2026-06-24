// TDD validation for Progressive Arrangements types (Task 0.1)
// This file can be run with tsx or checked with tsc

import type { Song, Arrangement, Tab } from './song';

const sampleTab: Tab = {
  id: 'test-tab',
  title: 'Test',
  measures: [],
  tuning: ['G', 'D', 'G', 'B', 'D'],
  tempo: 120,
};

const sampleArrangement: Arrangement = {
  id: 'arr-1',
  level: 1,
  label: 'Beginner',
  tab: sampleTab,
  description: 'Simple melody only',
};

const sampleSong: Song = {
  id: 'test-song',
  title: 'Test Song',
  artist: 'Traditional',
  genre: 'Bluegrass',
  style: 'three-finger',
  arrangements: [sampleArrangement],
  chordsUsed: ['G', 'C'],
  duration: 120,
  tags: [],
};

// Basic runtime validation (will run in browser or with tsx)
function validate() {
  if (!sampleSong.arrangements || sampleSong.arrangements.length === 0) {
    throw new Error('FAIL: Song must have arrangements');
  }
  if (sampleSong.arrangements[0].level !== 1) {
    throw new Error('FAIL: Level should be 1 for Beginner');
  }
  console.log('✅ Task 0.1 Type & structure validation PASSED');
  console.log('  - Arrangement interface works');
  console.log('  - Song now uses arrangements array');
}

validate();