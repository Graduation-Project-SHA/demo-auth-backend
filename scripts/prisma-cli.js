const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const [,, envFile, ...args] = process.argv;

if (!envFile || args.length === 0) {
  console.error("❌ Usage: node scripts/prisma-cli.js .env.{env} <command>");
  process.exit(1);
}

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME
} = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
  console.error("❌ Missing required DB env variables.");
  process.exit(1);
}

const DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Paths
const envPath = path.resolve(process.cwd(), ".env");
const backupPath = path.resolve(process.cwd(), ".env.backup");

// Backup existing .env
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, backupPath);
}

// Write new .env
fs.writeFileSync(envPath, `DATABASE_URL="${DATABASE_URL}"\n`);

const isTsNode = args[0] === 'ts-node';
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
  } else {
    fs.unlinkSync(envPath);
  }
}
