# 🌱 goGreen v2.0

With **goGreen**, you can make your profile look like you've been hard at work... even if you haven't.  
Node.js script to make commits to the past (or the future) to go green on GitHub.

## About

**goGreen** helps you create commits on your GitHub profile for any date you choose. Whether you want to fill up your contribution graph with random green squares or **spell out text and pixel art** — goGreen has you covered.

## Features

- 🎲 **Random Mode** — Scatter commits across any date range
- 🎨 **Text / Pixel Art Mode** — Draw text on your contribution graph using a built-in 5×7 pixel font
- 📅 **Custom Date Range** — Target specific date ranges with `--from` and `--to`
- 🔆 **Intensity Control** — Adjust commits per pixel to control the shade of green
- 📊 **Terminal Preview** — See an emoji preview of your pattern before committing
- 📈 **Progress Bar** — Real-time progress tracking in the terminal

## Getting Started

1. **Clone this repository**
   ```bash
   git clone https://github.com/fenrir2608/goGreen.git
   cd goGreen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the script**
   ```bash
   node index.js --help
   ```

## Usage

### Random Mode (default)

Scatter commits randomly across a date range:

```bash
# 100 random commits in the past year (default)
node index.js

# 200 random commits (shorthand)
node index.js 200

# 300 commits in a specific date range
node index.js --commits 300 --from 2025-01-01 --to 2025-06-30

# Short flags also work
node index.js -n 300 --from 2025-01-01 --to 2025-06-30
```

### Text / Pixel Art Mode 🎨

Draw text on your GitHub contribution graph:

```bash
# Spell out "HELLO"
node index.js --text "HELLO"

# Start the text from a specific date
node index.js --text "HI" --from 2025-03-01

# Control intensity (more commits = darker green)
node index.js --text "GO" --intensity 10

# Short flags
node index.js -t "2025" -i 8
```

**Supported characters:** `A-Z` `0-9` `space` `! ? . - _ # @ + = / ( ) < > : * ♥`

### CLI Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--text <string>` | `-t` | Draw text on the contribution graph | — |
| `--commits <number>` | `-n` | Number of random commits | 100 |
| `--from <YYYY-MM-DD>` | — | Start date | ~1 year ago |
| `--to <YYYY-MM-DD>` | — | End date (random mode only) | today |
| `--intensity <number>` | `-i` | Commits per pixel in text mode | 5 |
| `--help` | `-h` | Show help message | — |

### Intensity Guide

The shade of green on GitHub depends on how many commits you have on a given day:

| Intensity | Shade | Recommended for |
|-----------|-------|-----------------|
| 1–3 | 🟩 Light green | Subtle patterns |
| 4–7 | 🟩 Medium green | Normal visibility |
| 8–12 | 🟩 Dark green | High contrast |
| 13+ | 🟩 Darkest green | Maximum impact |

## Example Output

```
  🌱 goGreen v2.0

  🎨 Text Mode: "HI"
  ─────────────────────────────────────
  📅  Start       2025-03-02 (Sunday)
  📅  End         2025-06-01
  📐  Grid        11 weeks × 7 days
  🟩  Pixels      20 active
  🔆  Intensity   5 commits/pixel
  📝  Total       100 commits
  ─────────────────────────────────────

  📊 Contribution Graph Preview:

   Sun  🟩⬛⬛⬛🟩⬛🟩⬛🟩⬛🟩
   Mon  🟩⬛⬛⬛🟩⬛🟩⬛🟩⬛🟩
   Tue  🟩⬛⬛⬛🟩⬛🟩⬛🟩⬛🟩
   Wed  🟩🟩🟩🟩🟩⬛🟩⬛🟩⬛🟩
   Thu  🟩⬛⬛⬛🟩⬛🟩⬛🟩⬛🟩
   Fri  🟩⬛⬛⬛🟩⬛🟩⬛🟩⬛🟩
   Sat  🟩⬛⬛⬛🟩⬛🟩⬛🟩⬛🟩

  █████████████████████████ 100% [100/100]  📅 2025-05-25T00:00:00+05:30

  🚀 Done! "HI" drawn with 100 commits!
```

## Project Structure

```
goGreen/
├── index.js       — Main script with CLI parsing and both modes
├── fonts.js       — 5×7 pixel font definitions (A-Z, 0-9, symbols)
├── data.json      — Temporary file used for commit data
├── package.json   — Dependencies and project config
└── README.md      — You're reading it!
```

## npm Modules Used

- [`dayjs`](https://www.npmjs.com/package/dayjs) — Lightweight date/time manipulation
- [`simple-git`](https://www.npmjs.com/package/simple-git) — Programmatic Git commands
- [`random`](https://www.npmjs.com/package/random) — Random number generation
- [`jsonfile`](https://www.npmjs.com/package/jsonfile) — JSON file read/write with async support

## Room for Improvement

- **Custom Patterns:** Load pixel art from image files or custom grid definitions
- **Fill Gaps Mode:** Analyze your current graph and fill only the empty days
- **Realistic Mode:** Mimic natural commit patterns (fewer on weekends, etc.)
- **Undo:** Revert the last batch of goGreen commits
- **Interactive CLI:** Use `inquirer` for a guided, menu-driven experience

## Credits

Huge thanks to [Akshay Saini](https://github.com/akshaymarch7) for the original video behind this project.

## License

[MIT](LICENSE)
