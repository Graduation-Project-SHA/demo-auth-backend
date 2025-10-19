const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const [,, envFile, ...args] = process.argv;

if (!envFile || args.length === 0) {
  console.error("❌ Usage: node scripts/prisma-cli.js .env.{env} <command>");
  process.exit(1);
}

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL in the specified env file.");
  process.exit(1);
}

// Paths
const envPath = path.resolve(process.cwd(), ".env");
const backupPath = path.resolve(process.cwd(), ".env.backup");

// Backup existing .env if it exists
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, backupPath);
}

// Write the DATABASE_URL to a temporary .env file for Prisma
fs.writeFileSync(envPath, `DATABASE_URL="${DATABASE_URL}"\n`);

const isTsNode = args[0] === "ts-node";
const command = isTsNode
  ? `npx prisma generate && npx ${args.join(" ")}`
  : `npx prisma ${args.join(" ")}`;

console.log(`🔧 Running: ${command}`);

try {
  execSync(command, { stdio: "inherit", shell: true });
} catch (err) {
  console.error("❌ Command failed.");
  process.exit(1);
} finally {
  // Restore original .env
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, envPath);
  } else if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath);
  }
}
