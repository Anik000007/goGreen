import jsonfile from "jsonfile";
import dayjs from "dayjs";
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

// Extract date calculation to avoid redundant computation
const calculateDate = (weekOffset, dayOffset) => {
  return dayjs()
    .subtract(1, "year")
    .add(1, "day")
    .add(weekOffset, "week")
    .add(dayOffset, "day")
    .format();

  const data = {
    date: date,
  };

  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date }).push();
  });
};

const makeCommits = (n) => {
  if(n===0) return simpleGit().push();
  const x = random.int(0, 54);
  const y = random.int(0, 6);
  const date = moment().subtract(1, "y").add(1, "d").add(x, "w").add(y, "d").format();

  const data = {
    date: date,
  };
  console.log(date);
  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date },makeCommits.bind(this,--n));
  });
};

makeCommits(100);
