import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

// Parse command-line arguments
const getCommitCount = () => {
  const args = process.argv.slice(2);
  const commitCountArg = args[0];

  if (!commitCountArg) {
    console.log("📝 No commit count specified. Using default: 100");
    return 100;
  }

  const count = parseInt(commitCountArg, 10);

  if (isNaN(count) || count < 1) {
    console.error("❌ Error: Commit count must be a positive integer");
    process.exit(1);
  }

  console.log(`📝 Creating ${count} commits...`);
  return count;
};

const markCommit = (x, y) => {
  const date = moment()
    .subtract(1, "y")
    .add(1, "d")
    .add(x, "w")
    .add(y, "d")
    .format();

  const data = {
    date: date,
  };

  jsonfile.writeFile(path, data, (err) => {
    if (err) {
      console.error("❌ Error writing to data.json:", err);
      return;
    }

    simpleGit()
      .add([path])
      .commit(date, { "--date": date })
      .push()
      .catch((err) => {
        console.error("❌ Error committing or pushing:", err);
      });
  });
};

const makeCommits = (n, total) => {
  if(n === 0) {
    return simpleGit()
      .push()
      .then(() => {
        console.log("✅ All commits completed successfully!");
      })
      .catch((err) => {
        console.error("❌ Error during final push:", err);
        process.exit(1);
      });
  }

  const x = random.int(0, 54);
  const y = random.int(0, 6);
  const date = moment()
    .subtract(1, "y")
    .add(1, "d")
    .add(x, "w")
    .add(y, "d")
    .format();

  const data = {
    date: date,
  };

  const progress = ((total - n + 1) / total * 100).toFixed(1);
  console.log(`[${progress}%] Creating commit: ${date}`);

  jsonfile.writeFile(path, data, (err) => {
    if (err) {
      console.error("❌ Error writing to data.json:", err);
      process.exit(1);
    }

    simpleGit()
      .add([path])
      .commit(date, { "--date": date })
      .then(() => {
        makeCommits(--n, total);
      })
      .catch((err) => {
        console.error("❌ Error committing:", err);
        process.exit(1);
      });
  });
};

// Main execution
try {
  const commitCount = getCommitCount();
  makeCommits(commitCount, commitCount);
} catch (err) {
  console.error("❌ Fatal error:", err);
  process.exit(1);
}
