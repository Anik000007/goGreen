import jsonfile from "jsonfile";
import dayjs from "dayjs";
import simpleGit from "simple-git";
import random from "random";
import { FONT, SUPPORTED_CHARS } from "./fonts.js";

const DATA_PATH = "./data.json";
const git = simpleGit();

// ╔══════════════════════════════════════════════════════════╗
// ║                 CLI Argument Parsing                     ║
// ╚══════════════════════════════════════════════════════════╝

const parseArgs = () => {
  const args = process.argv.slice(2);

  const config = {
    mode: "random",   // "random" or "text"
    commits: 100,     // number of random commits
    text: null,       // text to draw in text mode
    from: null,       // start date (dayjs object)
    to: null,         // end date (dayjs object)
    intensity: 5,     // commits per active pixel in text mode
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--text":
      case "-t":
        config.mode = "text";
        config.text = (args[++i] || "").toUpperCase();
        break;

      case "--commits":
      case "-n":
        config.commits = parseInt(args[++i], 10);
        break;

      case "--from":
        config.from = dayjs(args[++i]);
        if (!config.from.isValid()) {
          console.error("❌ Error: Invalid --from date. Use YYYY-MM-DD format.");
          process.exit(1);
        }
        break;

      case "--to":
        config.to = dayjs(args[++i]);
        if (!config.to.isValid()) {
          console.error("❌ Error: Invalid --to date. Use YYYY-MM-DD format.");
          process.exit(1);
        }
        break;

      case "--intensity":
      case "-i":
        config.intensity = parseInt(args[++i], 10);
        break;

      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;

      default:
        // Backward compatibility: first bare number = commit count
        if (i === 0 && !isNaN(parseInt(args[i], 10))) {
          config.commits = parseInt(args[i], 10);
        } else {
          console.error(`❌ Unknown argument: ${args[i]}`);
          console.error(`   Run "node index.js --help" for usage info.\n`);
          process.exit(1);
        }
        break;
    }
  }

  // ── Validation ──
  if (config.mode === "text" && !config.text) {
    console.error('❌ Error: --text requires a string, e.g. --text "HELLO"');
    process.exit(1);
  }

  if (config.mode === "text") {
    // Check for unsupported characters
    const unsupported = [...config.text].filter((ch) => !FONT[ch]);
    if (unsupported.length > 0) {
      console.error(`❌ Error: Unsupported characters: ${[...new Set(unsupported)].join(", ")}`);
      console.error(`   Supported: ${SUPPORTED_CHARS}`);
      process.exit(1);
    }
    if (config.intensity < 1 || isNaN(config.intensity)) {
      console.error("❌ Error: --intensity must be a positive integer.");
      process.exit(1);
    }
  }

  if (config.mode === "random" && (config.commits < 1 || isNaN(config.commits))) {
    console.error("❌ Error: --commits must be a positive integer.");
    process.exit(1);
  }

  if (config.from && config.to && config.to.isBefore(config.from)) {
    console.error("❌ Error: --to date must be after --from date.");
    process.exit(1);
  }

  return config;
};

const printHelp = () => {
  console.log(`
🌱 goGreen — Fill your GitHub contribution graph

USAGE:
  node index.js [options]

MODES:
  Random Mode (default):
    node index.js                                  # 100 random commits in past year
    node index.js 200                              # 200 random commits (shorthand)
    node index.js --commits 200                    # 200 random commits
    node index.js -n 200 --from 2025-01-01 --to 2025-06-30

  Text / Pixel Art Mode:
    node index.js --text "HELLO"                   # Draw "HELLO" on contribution graph
    node index.js -t "HI" --from 2025-03-01        # Start drawing from a specific date
    node index.js -t "GO" --intensity 8            # 8 commits per pixel (darker green)

OPTIONS:
  --text, -t <string>         Draw text on the contribution graph
  --commits, -n <number>      Number of random commits (default: 100)
  --from <YYYY-MM-DD>         Start date (default: ~1 year ago)
  --to <YYYY-MM-DD>           End date (default: today) [random mode only]
  --intensity, -i <number>    Commits per active pixel in text mode (default: 5)
                               1-3: light green, 4-7: medium, 8+: dark green
  --help, -h                  Show this help message

EXAMPLES:
  node index.js -t "I ♥ CODE" --intensity 10
  node index.js -n 365 --from 2024-06-01 --to 2025-01-01
  node index.js -t "2025" --from 2025-01-05

SUPPORTED CHARACTERS:
  A-Z  0-9  space  ! ? . - _ # @ + = / ( ) < > : * ♥
`);
};

// ╔══════════════════════════════════════════════════════════╗
// ║              Text → Pixel Grid Conversion                ║
// ╚══════════════════════════════════════════════════════════╝

const CHAR_WIDTH = 5;
const CHAR_HEIGHT = 7;
const CHAR_GAP = 1; // 1-week gap between characters

/**
 * Converts a text string into a 7-row × N-column grid of 0s and 1s.
 * Each row = a day of the week (Sun–Sat).
 * Each column = a week on the GitHub contribution graph.
 */
const textToGrid = (text) => {
  const grid = Array.from({ length: CHAR_HEIGHT }, () => []);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const bitmap = FONT[char] || FONT[" "];

    for (let row = 0; row < CHAR_HEIGHT; row++) {
      const line = bitmap[row] || "     ";
      for (let col = 0; col < CHAR_WIDTH; col++) {
        grid[row].push(line[col] === "#" ? 1 : 0);
      }
      // Add gap between characters (except after the last one)
      if (i < text.length - 1) {
        grid[row].push(0);
      }
    }
  }

  return grid;
};

/**
 * Prints an ASCII/emoji preview of the grid to the terminal.
 */
const previewGrid = (grid) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  console.log("\n  📊 Contribution Graph Preview:\n");
  for (let row = 0; row < grid.length; row++) {
    const line = grid[row].map((cell) => (cell ? "🟩" : "⬛")).join("");
    console.log(`   ${days[row]}  ${line}`);
  }
  console.log();
};

// ╔══════════════════════════════════════════════════════════╗
// ║                   Commit Helpers                         ║
// ╚══════════════════════════════════════════════════════════╝

/**
 * Create a single commit with a specific date.
 */
const makeCommit = async (date) => {
  const data = { date };
  await jsonfile.writeFile(DATA_PATH, data);
  await git.add([DATA_PATH]).commit(date, { "--date": date });
};

/**
 * Render a progress bar string.
 */
const progressBar = (current, total, width = 25) => {
  const ratio = current / total;
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  const pct = (ratio * 100).toFixed(0).padStart(3);
  return `  ${bar} ${pct}% [${current}/${total}]`;
};

// ╔══════════════════════════════════════════════════════════╗
// ║               Mode 1: Random Commits                     ║
// ╚══════════════════════════════════════════════════════════╝

const randomMode = async (config) => {
  const from = config.from || dayjs().subtract(1, "year").add(1, "day");
  const to = config.to || dayjs();
  const totalDays = to.diff(from, "day");

  if (totalDays <= 0) {
    console.error("❌ Error: Date range is empty or negative.");
    process.exit(1);
  }

  console.log(`\n  🎲 Random Mode`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  📅  Range       ${from.format("YYYY-MM-DD")} → ${to.format("YYYY-MM-DD")} (${totalDays} days)`);
  console.log(`  📝  Commits     ${config.commits}`);
  console.log(`  ─────────────────────────────────────\n`);

  for (let i = 1; i <= config.commits; i++) {
    const dayOffset = random.int(0, totalDays);
    const date = from.add(dayOffset, "day").format();

    await makeCommit(date);

    // Update progress in-place
    process.stdout.write(`\r${progressBar(i, config.commits)}  📅 ${date}`);
  }

  console.log("\n");
  console.log("  ⏳ Pushing to remote...");
  await git.push();
  console.log(`  🚀 Done! ${config.commits} commits pushed successfully!\n`);
};

// ╔══════════════════════════════════════════════════════════╗
// ║            Mode 2: Text / Pixel Art                      ║
// ╚══════════════════════════════════════════════════════════╝

const textMode = async (config) => {
  const grid = textToGrid(config.text);
  const gridWidth = grid[0].length;

  // Calculate start date — align to the nearest past Sunday
  let startDate = config.from || dayjs().subtract(1, "year").add(1, "day");
  const dayOfWeek = startDate.day(); // 0 = Sunday
  if (dayOfWeek !== 0) {
    startDate = startDate.subtract(dayOfWeek, "day");
  }

  // Check that the pattern fits within the contribution graph
  const endDate = startDate.add(gridWidth, "week");
  if (endDate.isAfter(dayjs())) {
    console.warn(`  ⚠️  Warning: Pattern extends to ${endDate.format("YYYY-MM-DD")}, which is in the future.`);
    console.warn(`  ⚠️  Some columns may not appear on your current GitHub graph.\n`);
  }

  // Count active pixels
  let totalPixels = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col]) totalPixels++;
    }
  }

  const totalCommits = totalPixels * config.intensity;

  console.log(`\n  🎨 Text Mode: "${config.text}"`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  📅  Start       ${startDate.format("YYYY-MM-DD")} (Sunday)`);
  console.log(`  📅  End         ${endDate.format("YYYY-MM-DD")}`);
  console.log(`  📐  Grid        ${gridWidth} weeks × 7 days`);
  console.log(`  🟩  Pixels      ${totalPixels} active`);
  console.log(`  🔆  Intensity   ${config.intensity} commits/pixel`);
  console.log(`  📝  Total       ${totalCommits} commits`);
  console.log(`  ─────────────────────────────────────`);

  previewGrid(grid);

  let commitCount = 0;

  for (let col = 0; col < gridWidth; col++) {
    for (let row = 0; row < 7; row++) {
      if (grid[row] && grid[row][col]) {
        const date = startDate.add(col, "week").add(row, "day").format();

        for (let k = 0; k < config.intensity; k++) {
          commitCount++;
          await makeCommit(date);
          process.stdout.write(`\r${progressBar(commitCount, totalCommits)}  📅 ${date}`);
        }
      }
    }
  }

  console.log("\n");
  console.log("  ⏳ Pushing to remote...");
  await git.push();
  console.log(`  🚀 Done! "${config.text}" drawn with ${totalCommits} commits!\n`);
};

// ╔══════════════════════════════════════════════════════════╗
// ║                       Main                               ║
// ╚══════════════════════════════════════════════════════════╝

const main = async () => {
  console.log("\n  🌱 goGreen v2.0\n");

  try {
    const config = parseArgs();

    if (config.mode === "text") {
      await textMode(config);
    } else {
      await randomMode(config);
    }
  } catch (err) {
    console.error(`\n  ❌ Fatal Error: ${err.message}\n`);
    process.exit(1);
  }
};

main();
