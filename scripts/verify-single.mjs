import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function verifySingle(root) {
  const html = readFileSync(join(root, "single-file/index.html"), "utf8");
  assert(!/<script\b[^>]*\bsrc=/.test(html), "External script entry remains");
  assert(!/href="\.\/assets\//.test(html), "External stylesheet remains");
  assert(
    !html.includes('src="/src/main.tsx"'),
    "Development entry in production",
  );
  const match = html.match(
    /<script id="site-assets">window\.__SITE_ASSETS__=(.*?)<\/script>/s,
  );
  assert(match, "Embedded media manifest missing");
  const assets = JSON.parse(match[1]);
  for (let index = 1; index <= 7; index++) {
    const name = `works/lighting/d${index}.webp`;
    assert(assets[name], `Lighting artwork missing: ${name}`);
  }
  for (let index = 1; index <= 16; index++) {
    const name = `placeholders/frame-${String(index).padStart(2, "0")}.svg`;
    assert(assets[name], `Portfolio placeholder missing: ${name}`);
  }
  assert(
    !Object.keys(assets).some(
      (path) => path.startsWith("media/") || path.startsWith("art/"),
    ),
    "Former portfolio media must not be embedded",
  );
  for (const [rel, uri] of Object.entries(assets)) {
    assert(
      Buffer.from(uri.split(";base64,")[1], "base64").equals(
        readFileSync(join(root, "public", rel)),
      ),
      `Embedded bytes differ: ${rel}`,
    );
  }
  const modules = [
    ...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g),
  ];
  assert.equal(modules.length, 1, "Missing or fragmented application script");
  assert(
    Buffer.byteLength(html) < 25 * 1024 * 1024,
    "HTML exceeds Cloudflare Pages 25 MiB asset limit; use external video hosting for larger films",
  );
  const checkDir = mkdtempSync(join(tmpdir(), "tristanlee-build-"));
  try {
    const checkFile = join(checkDir, "app.mjs");
    writeFileSync(checkFile, modules[0][1]);
    execFileSync(process.execPath, ["--check", checkFile], { stdio: "pipe" });
  } finally {
    rmSync(checkDir, { recursive: true, force: true });
  }
  console.log(
    `Verified inline application and ${Object.keys(assets).length} byte-identical media assets`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  verifySingle(join(dirname(fileURLToPath(import.meta.url)), ".."));
}
