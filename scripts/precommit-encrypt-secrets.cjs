#!/usr/bin/env node

const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.dirname(__dirname);
const ENV_FILE = ".env";
const ENV_ENC_FILE = ".env.enc";

function decryptText(encryptedContent, password) {
  const [ivHex, encryptedData] = encryptedContent.split(":");
  if (!ivHex || !encryptedData) {
    throw new Error("Encrypted file is not in the expected IV:data format.");
  }

  const key = crypto.scryptSync(password, "salt", 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(ivHex, "hex")
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function encryptText(plainText, password) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function parsePasswordFromEnvFile() {
  const envPath = path.join(PROJECT_ROOT, ENV_FILE);
  if (!fs.existsSync(envPath)) return "";

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^PASSWORD=(.*)$/);
    if (!match) continue;
    return match[1].replace(/^['"]|['"]$/g, "");
  }

  return "";
}

function getPassword() {
  return process.env.PASSWORD || process.env.SECRETS_PASSWORD || parsePasswordFromEnvFile();
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

const plainPath = path.join(PROJECT_ROOT, ENV_FILE);
const encryptedPath = path.join(PROJECT_ROOT, ENV_ENC_FILE);

if (!fs.existsSync(plainPath)) {
  process.exit(0);
}

const encryptedExists = fs.existsSync(encryptedPath);
const password = getPassword();

if (encryptedExists && password) {
  try {
    const plain = fs.readFileSync(plainPath, "utf8");
    const decrypted = decryptText(fs.readFileSync(encryptedPath, "utf8"), password);
    if (plain === decrypted) {
      process.exit(0);
    }
  } catch (error) {
    fail(
      [
        "Pre-commit blocked: encrypted .env comparison failed.",
        error.message,
        "",
        "Check that PASSWORD is correct, then commit again.",
      ].join("\n")
    );
  }
}

if (!password) {
  const status = !encryptedExists
    ? "missing"
    : fs.statSync(plainPath).mtimeMs > fs.statSync(encryptedPath).mtimeMs
      ? "possibly stale"
      : "needs content verification";

  fail(
    [
      `Pre-commit blocked: .env.enc is ${status}.`,
      "",
      "Run one of these, then commit again:",
      "  PASSWORD=<passphrase> node scripts/precommit-encrypt-secrets.cjs",
      "  PASSWORD=<passphrase> git commit ...",
      "",
      "The hook will not prompt for a password because non-terminal Git clients can hang.",
    ].join("\n")
  );
}

const encrypted = encryptText(fs.readFileSync(plainPath, "utf8"), password);
fs.writeFileSync(encryptedPath, encrypted);
execFileSync("git", ["add", "--", ENV_ENC_FILE], {
  cwd: PROJECT_ROOT,
  stdio: "inherit",
});
console.log("Encrypted .env refreshed and staged.");
