# BanjoMaster

A full-featured web app for learning to play the 5-string banjo. Built with Next.js, it works on desktop and mobile browsers with offline-capable data storage.

## Features

### Chord Library
Browse 45 banjo chords in standard Open G tuning (gDGBD). Each chord is rendered as an interactive SVG diagram showing finger positions, open/muted strings, and barres. Filter by root note, quality (major, minor, 7th, etc.), and difficulty level.

### Song Library
15 classic banjo songs with full tablature notation, from beginner (Cripple Creek, Boil Them Cabbage Down) to advanced (Foggy Mountain Breakdown, Earl's Breakdown). Each song includes:
- SVG-based tab viewer with 5-string notation
- Fret numbers, measure bars, and technique annotations (hammer-ons, pull-offs, slides, bends)
- Song metadata: artist, genre, style, difficulty, chords used
- Filter by difficulty, picking style, and genre

### Lesson Curriculum
25 structured lessons across 5 progressive modules:
1. **Getting Started** - Parts of the banjo, holding position, Open G tuning, basic picks
2. **Essential Techniques** - Alternating thumb roll, pinch patterns, slides, hammer-ons, pull-offs
3. **Building Songs** - First songs, chord transitions, adding melody, metronome practice
4. **Intermediate Skills** - Scruggs style, bends/chokes, up-the-neck, melodic style, playing by ear
5. **Advanced Concepts** - Chromatic runs, improvisation, jam sessions, performance, practice routines

Each lesson includes learning objectives, detailed content, and interactive exercises.

### Interactive Exercise Runner
Exercises in each lesson are fully interactive. When you start an exercise the app:
- **Tells you what to play** — displays the tab pattern, chord, or rhythm target with BPM
- **Counts you in** — 4-beat metronome count-off at the exercise's target tempo
- **Listens to your playing** — real-time pitch detection (YIN autocorrelation) evaluates note accuracy against the expected pattern
- **Checks your timing** — onset detection classifies each note as perfect, good, early, late, or miss relative to the beat grid
- **Watches your hands** (optional) — MediaPipe hand landmark detection checks hand presence in the correct zones and flags wrist posture issues
- **Gives real-time feedback** — color-coded timing/accuracy indicators and hand position messages
- **Scores and reviews** — composite score (40% accuracy + 40% timing + 20% hand placement), detailed breakdown, pass/fail against the exercise's threshold, and option to retry

Camera-based hand detection is opt-in. When disabled, scoring adjusts to 50/50 accuracy and timing.

### Practice Tracker
- **Session timer** with activity type selector (chord practice, song practice, lesson, free play, metronome)
- **Streak tracking** with current and longest streak
- **30-day streak calendar** showing practice history with intensity shading
- **Skill level bars** for 5 areas: Chords, Picking, Timing, Repertoire, Theory
- **Daily goal** progress bar (default 15 minutes)
- **Recent sessions** list with duration and activity details

### Smart Recommendations
The recommendation engine analyzes your progress and suggests:
- Your next lesson based on completion order
- Songs matching your current difficulty level
- Chord practice for chords in upcoming songs
- Technique drills for weak skill areas
- Easy review material if your practice streak breaks

### Metronome
- Adjustable tempo (40-240 BPM) with slider and fine-tune buttons
- Tap tempo (averages last 4 taps)
- Time signatures: 4/4, 3/4, 6/8, 2/4
- Visual beat indicator with accent on beat 1
- Volume control
- Web Audio API for precise timing

### Chromatic Tuner
- Real-time pitch detection using YIN autocorrelation algorithm via the Web Audio API
- Visual cents gauge (-50 to +50) with color-coded accuracy (green/yellow/red)
- String selector for all 5 banjo strings
- Reference pitch table for Open G tuning
- Optimized for banjo frequency range (60-700 Hz)

### Hand Position Camera
- Live camera feed with grid overlay for positioning reference
- Hand position guide zones for fretting and picking hands
- MediaPipe hand landmark detection for real-time hand presence and posture feedback
- Cycling tips with context-aware advice based on current lesson
- Camera setup instructions and proper hand position reference guide
- Supports front and rear cameras (rear preferred on mobile for filming hands)

### Settings
- Dark mode toggle with persistent preference

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom amber/brown theme and dark mode
- **Database**: IndexedDB via [Dexie.js](https://dexie.org/) (all data stored locally in the browser)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) for UI and exercise session state
- **Audio**: Web Audio API for metronome, pitch detection, and exercise analysis
- **Camera**: MediaDevices API + [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) for hand detection
- **Deployment**: Docker with Caddy reverse proxy (self-signed HTTPS for mic/camera access)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- npm, yarn, pnpm, or bun

### Local Development

```bash
git clone https://github.com/bwilliam79/banjo-master.git
cd banjo-master
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Browser Permissions

Some features require browser permissions:
- **Microphone**: Required for the tuner, pitch monitor, and interactive exercises. Grant access when prompted.
- **Camera**: Required for hand position detection during exercises. Grant access when prompted.
- **HTTPS**: Microphone and camera access require a secure context. Use the Docker deployment with Caddy for HTTPS, or access via `localhost` during development.

## Deployment

### Docker (Recommended for Self-Hosting)

The project includes a multi-stage Dockerfile and Caddy reverse proxy with self-signed HTTPS, which is required for microphone and camera access on non-localhost hosts.

```bash
git clone https://github.com/bwilliam79/banjo-master.git
cd banjo-master
docker compose up -d
```

This starts:
- **banjo-master** — Next.js standalone server on port 3000 (internal only)
- **cert-gen** — one-shot container that generates a self-signed TLS certificate
- **caddy** — reverse proxy on ports 80/443 with HTTPS

Access the app at `https://<your-host>`. Accept the self-signed certificate warning in your browser.

To rebuild after pulling updates:

```bash
git pull
docker compose down
docker compose up -d --build
```

### Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Vercel auto-detects Next.js — no configuration needed
4. Click **Deploy**

### Static Export

For simple static hosting (GitHub Pages, S3, etc.):

1. Change `output` in `next.config.ts` from `'standalone'` to `'export'`
2. Run `npm run build` — the static site will be in the `out/` directory
3. Upload the `out/` directory to your hosting provider

> **Note**: Static export works for this app since all data is stored client-side in IndexedDB.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chords/            # Chord library
│   ├── lessons/           # Lesson curriculum & detail pages
│   ├── practice/          # Practice tracker
│   ├── settings/          # App settings (dark mode)
│   ├── songs/             # Song library & detail pages
│   └── tools/             # Metronome, tuner, camera
├── components/
│   ├── camera/            # Camera feed, hand position guide
│   ├── chord/             # Chord diagram, grid, filters
│   ├── exercise/          # Interactive exercise runner & sub-components
│   ├── layout/            # App shell, header, sidebar, bottom nav
│   ├── metronome/         # Metronome component
│   ├── practice/          # Timer, recommendations, streak calendar
│   ├── tab/               # Tablature viewer
│   ├── tuner/             # Chromatic tuner
│   └── ui/                # Shared UI components
├── data/                  # JSON data (chords, songs, lessons)
├── lib/
│   ├── audio/             # Audio context, pitch detection, rhythm analysis
│   ├── camera/            # Camera manager, MediaPipe hand detection
│   ├── db/                # Dexie database schema & seeding
│   ├── recommendations/   # Practice recommendation engine
│   └── scoring/           # Exercise scoring & progress updates
├── stores/                # Zustand stores (app, metronome, exercise)
└── types/                 # TypeScript interfaces
```

## Usage Guide

### Getting Started as a Beginner

1. **Start with Lessons** — Go to the Lessons tab and begin with "Meet Your Banjo". Work through the Getting Started module in order.
2. **Tune Up** — Use the Tuner (Tools > Tuner) to tune your banjo to Open G (gDGBD) before each practice session.
3. **Learn Chords** — Visit the Chord Library to study G, C, and D7 — the first chords you'll need.
4. **Practice with the Metronome** — Start slow (60-80 BPM) and gradually increase speed as you get comfortable.
5. **Try Your First Song** — Once you've completed a few lessons, try "Cripple Creek" or "Boil Them Cabbage Down" in the Song Library.

### Interactive Exercises

1. Open a lesson and scroll to the **Exercises** section
2. Click **Start Exercise** on any exercise
3. Optionally enable the **Hand Position Camera** toggle
4. Click **Start** — a 4-beat count-in plays at the target BPM
5. Play along — the app listens to your microphone and shows real-time feedback
6. When finished, review your score breakdown and retry or continue

### Daily Practice Routine

1. Open the **Practice** tab to see your recommendations
2. Click **Start Practice Session** to begin timing
3. Warm up with chord transitions (5 min)
4. Work on your current lesson exercises (10 min)
5. Practice a song at slow tempo (10 min)
6. Free play / review (5 min)
7. Stop the timer to save your session

### Using the Camera

1. Go to **Tools > Hand Position Camera**
2. Position your device so the camera can see your hands on the banjo
3. On mobile, use the rear camera for the best angle
4. Check the position guide zones and compare with the tips
5. Focus on keeping your thumb behind the neck and fingers curved

### Using the Tuner

1. Go to **Tools > Tuner** and tap **Start Tuner**
2. Grant microphone access when prompted
3. Pluck a string and watch the gauge
4. Green = in tune, yellow = close, red = needs adjustment
5. Use the string selector to see which string you're targeting
6. Always tune UP to the note for better stability

## License

MIT
