import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "apps/web/public/manifest.webmanifest",
  "apps/web/public/sw.js",
  "apps/web/public/offline.html",
  "apps/web/src/app/robots.ts",
  "apps/web/src/app/sitemap.ts",
  "docs/SECURITY_REVIEW.md",
  "docs/DEPLOYMENT_GUIDE.md",
  "docs/BACKUP_RECOVERY.md",
  ".dockerignore",
  ".github/workflows/ci.yml",
];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error(`Missing production readiness files:\n${missing.join("\n")}`);
  process.exit(1);
}

const rootGitignore = fs.existsSync(path.join(root, ".gitignore"))
  ? fs.readFileSync(path.join(root, ".gitignore"), "utf8")
  : "";
for (const requiredPattern of ["GoogleAuth.txt", "client_secret*.json", "!.env.production.example", "!apps/web/.env.example", "!apps/api/.env.example"]) {
  if (!rootGitignore.includes(requiredPattern)) {
    console.error(`.gitignore must include ${requiredPattern} for deployment safety.`);
    process.exit(1);
  }
}

const productionEnvExample = fs.existsSync(path.join(root, ".env.production.example"))
  ? fs.readFileSync(path.join(root, ".env.production.example"), "utf8")
  : "";
for (const requiredEnv of ["CODE_EXECUTION_PROVIDER=judge0", "JUDGE0_BASE_URL=", "JUDGE0_PYTHON_LANGUAGE_ID=71", "JUDGE0_JAVA_LANGUAGE_ID=62", "JUDGE0_CPP_LANGUAGE_ID=54"]) {
  if (!productionEnvExample.includes(requiredEnv)) {
    console.error(`.env.production.example is missing ${requiredEnv}.`);
    process.exit(1);
  }
}

const apiEnv = fs.existsSync(path.join(root, "apps/api/.env"))
  ? fs.readFileSync(path.join(root, "apps/api/.env"), "utf8")
  : "";
if (apiEnv && !apiEnv.includes("GEMINI_MODEL=gemini-2.5-flash-lite")) {
  console.error("GEMINI_MODEL must remain gemini-2.5-flash-lite.");
  process.exit(1);
}

console.log("Production readiness validation passed.");
