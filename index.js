import jsonfile from "jsonfile";
import dayjs from "dayjs";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

// Extract date calculation to avoid redundant computation
const calculateDate = (weekOffset, dayOffset) => {
  return dayjs()
    .subtract(1, "year")
    .add(1, "day")
    .add(weekOffset, "week")
    .add(dayOffset, "day")
    .format();
};

// Refactored to use async/await for better performance and error handling
const makeCommits = async (n) => {
  if (n === 0) return;

  const x = random.int(0, 54);
  const y = random.int(0, 6);
  const date = calculateDate(x, y);

  const data = {
    date: date,
  };

  try {
    console.log(date);
    await jsonfile.writeFile(path, data);
    const git = simpleGit();
    await git.add([path]);
    await git.commit(date, { "--date": date });
    await makeCommits(n - 1);
  } catch (error) {
    console.error(`Error creating commit: ${error.message}`);
    throw error;
  }
};

// Execute commits and push at the end
(async () => {
  try {
    await makeCommits(100);
    console.log("All commits created successfully. Pushing to remote...");
    await simpleGit().push();
    console.log("Push completed successfully.");
  } catch (error) {
    console.error(`Failed to complete operation: ${error.message}`);
    process.exit(1);
  }
})();
