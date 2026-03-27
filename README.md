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

Each lesson includes learning objectives, detailed content, and interactive exercises. Mark lessons complete to track your progress.

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
- Cycling tips with context-aware advice based on current lesson
- Camera setup instructions and proper hand position reference guide
- Supports front and rear cameras (rear preferred on mobile for filming hands)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom amber/brown theme and dark mode
- **Database**: IndexedDB via [Dexie.js](https://dexie.org/) (all data stored locally in the browser)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) for UI state
- **Audio**: Web Audio API for metronome and pitch detection
- **Camera**: MediaDevices API for camera access

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/brandondykun/banjo-master.git
cd banjo-master

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Browser Permissions

Some features require browser permissions:
- **Microphone**: Required for the chromatic tuner and pitch monitor. Grant access when prompted.
- **Camera**: Required for the hand position checker. Grant access when prompted.

These permissions are only requested when you actively use the tuner or camera features.

## Deployment

### Vercel (Recommended)

The easiest way to deploy is with [Vercel](https://vercel.com/):

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Vercel auto-detects Next.js — no configuration needed
4. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`.

### Netlify

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com/) and click "Add new site" > "Import an existing project"
3. Connect your GitHub repo
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Install the [Next.js runtime plugin](https://docs.netlify.com/frameworks/next-js/overview/) (Netlify prompts for this automatically)
6. Click **Deploy site**

### Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

To use the standalone output, add to `next.config.ts`:

```ts
const nextConfig = {
  output: 'standalone',
};
```

Then build and run:

```bash
docker build -t banjo-master .
docker run -p 3000:3000 banjo-master
```

### Static Export

For simple static hosting (GitHub Pages, S3, etc.):

1. Add to `next.config.ts`:
   ```ts
   const nextConfig = {
     output: 'export',
   };
   ```
2. Run `npm run build` — the static site will be in the `out/` directory
3. Upload the `out/` directory to your hosting provider

> **Note**: Static export works for this app since all data is stored client-side in IndexedDB. No server-side API routes are needed.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chords/            # Chord library
│   ├── lessons/           # Lesson curriculum & detail pages
│   ├── songs/             # Song library & detail pages
│   ├── practice/          # Practice tracker
│   └── tools/             # Metronome, tuner, camera
├── components/
│   ├── camera/            # Camera feed, hand position guide
│   ├── chord/             # Chord diagram, grid, filters
│   ├── layout/            # App shell, header, sidebar, bottom nav
│   ├── metronome/         # Metronome component
│   ├── practice/          # Timer, recommendations, streak calendar
│   ├── tab/               # Tablature viewer
│   ├── tuner/             # Chromatic tuner
│   └── ui/                # Shared UI components
├── data/                  # JSON data (chords, songs, lessons)
├── lib/
│   ├── audio/             # Audio context, pitch detection
│   ├── camera/            # Camera manager
│   ├── db/                # Dexie database schema & seeding
│   └── recommendations/   # Practice recommendation engine
├── stores/                # Zustand stores
└── types/                 # TypeScript interfaces
```

## Usage Guide

### Getting Started as a Beginner

1. **Start with Lessons** — Go to the Lessons tab and begin with "Meet Your Banjo". Work through the Getting Started module in order.
2. **Tune Up** — Use the Tuner (Tools > Tuner) to tune your banjo to Open G (gDGBD) before each practice session.
3. **Learn Chords** — Visit the Chord Library to study G, C, and D7 — the first chords you'll need.
4. **Practice with the Metronome** — Start slow (60-80 BPM) and gradually increase speed as you get comfortable.
5. **Try Your First Song** — Once you've completed a few lessons, try "Cripple Creek" or "Boil Them Cabbage Down" in the Song Library.

### Daily Practice Routine

1. Open the **Practice** tab to see your recommendations
2. Click **Start Practice Session** to begin timing
3. Warm up with chord transitions (5 min)
4. Work on your current lesson (10 min)
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
