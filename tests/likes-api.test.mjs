import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { after, before, beforeEach, test } from "node:test";
import { build } from "esbuild";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";

const root = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://portfolio.test";
const workId = "luminous-ruins";
let runtime;
let database;
let publishedWorkIds;

before(async () => {
  const siteBundle = await build({
    entryPoints: ["src/data/site.ts"],
    absWorkingDir: root,
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
  });
  const { works } = await import(
    `data:text/javascript;base64,${Buffer.from(siteBundle.outputFiles[0].text).toString("base64")}`
  );
  publishedWorkIds = works.map((work) => work.id);
  const bundled = await build({
    stdin: {
      contents:
        'import { onRequest } from "./functions/api/likes/[[path]].ts"; export default { fetch(request, env) { return onRequest({request, env}); } };',
      resolveDir: root,
      sourcefile: "likes-test-worker.js",
    },
    bundle: true,
    write: false,
    format: "esm",
    target: "es2022",
    platform: "browser",
  });
  runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: bundled.outputFiles[0].text,
      compatibilityDate: "2026-09-16",
      d1Databases: ["LIKES_DB"],
    }),
  );
  database = await runtime.getD1Database("LIKES_DB");
  const schema = await readFile(
    new URL("../migrations/0001_likes.sql", import.meta.url),
    "utf8",
  );
  for (const statement of schema
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean)) {
    await database.prepare(statement).run();
  }
});

beforeEach(async () => {
  await database.prepare("DELETE FROM work_likes").run();
});

after(async () => {
  await runtime?.dispose();
});

async function visit(base = origin) {
  const response = await runtime.dispatchFetch(`${base}/api/likes`);
  assert.equal(response.status, 200);
  const cookieHeader = response.headers.get("Set-Cookie");
  assert.ok(cookieHeader);
  return {
    response,
    cookieHeader,
    cookie: cookieHeader.split(";")[0],
    body: await response.json(),
  };
}

function put(cookie, liked, options = {}) {
  return runtime.dispatchFetch(
    `${origin}/api/likes/${options.workId ?? workId}`,
    {
      method: "PUT",
      headers: {
        Origin: origin,
        Cookie: cookie,
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ?? JSON.stringify({ liked }),
    },
  );
}

test("new anonymous visitors receive zero counts and an HttpOnly cookie", async () => {
  const visitor = await visit();
  assert.equal(visitor.response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(
    Object.keys(visitor.body.counts).sort(),
    [...publishedWorkIds].sort(),
  );
  assert.ok(Object.values(visitor.body.counts).every((count) => count === 0));
  assert.deepEqual(visitor.body.liked, []);
  assert.match(visitor.cookieHeader, /HttpOnly/);
  assert.match(visitor.cookieHeader, /SameSite=Lax/);
  assert.match(visitor.cookieHeader, /Max-Age=31536000/);
  assert.match(visitor.cookieHeader, /; Secure/);
  const local = await visit("http://localhost");
  assert.doesNotMatch(local.cookieHeader, /; Secure/);
});

test("likes are shared across visitors, persisted across reloads, and idempotent", async () => {
  const a = await visit();
  const b = await visit();
  const first = await put(a.cookie, true);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { workId, count: 1, liked: true });
  assert.equal((await (await put(a.cookie, true)).json()).count, 1);
  assert.equal((await (await put(b.cookie, true)).json()).count, 2);
  const reload = await runtime.dispatchFetch(`${origin}/api/likes`, {
    headers: { Cookie: a.cookie },
  });
  assert.equal(reload.headers.get("Set-Cookie"), null);
  const body = await reload.json();
  assert.equal(body.counts[workId], 2);
  assert.deepEqual(body.liked, [workId]);
  assert.deepEqual(await (await put(a.cookie, false)).json(), {
    workId,
    count: 1,
    liked: false,
  });
  assert.equal((await (await put(a.cookie, false)).json()).count, 1);
  assert.equal((await visit()).body.counts[workId], 1);
});

test("concurrent repeated requests never double-count a visitor", async () => {
  const visitors = await Promise.all(Array.from({ length: 12 }, () => visit()));
  const responses = await Promise.all(
    visitors.flatMap(({ cookie }) => [put(cookie, true), put(cookie, true)]),
  );
  assert.ok(responses.every((response) => response.status === 200));
  assert.equal((await visit()).body.counts[workId], 12);
  const removals = await Promise.all(
    visitors.flatMap(({ cookie }) => [put(cookie, false), put(cookie, false)]),
  );
  assert.ok(removals.every((response) => response.status === 200));
  assert.equal((await visit()).body.counts[workId], 0);
});

test("newly published lighting work supports saved likes and cancellation", async () => {
  const dragonId = "how-to-train-your-dragon";
  const { cookie } = await visit();
  assert.ok(publishedWorkIds.includes(dragonId));
  const liked = await put(cookie, true, { workId: dragonId });
  assert.equal(liked.status, 200);
  assert.deepEqual(await liked.json(), {
    workId: dragonId,
    count: 1,
    liked: true,
  });
  const reload = await runtime.dispatchFetch(`${origin}/api/likes`, {
    headers: { Cookie: cookie },
  });
  const body = await reload.json();
  assert.equal(body.counts[dragonId], 1);
  assert.deepEqual(body.liked, [dragonId]);
  assert.deepEqual(
    await (await put(cookie, false, { workId: dragonId })).json(),
    { workId: dragonId, count: 0, liked: false },
  );
});

test("likes are isolated per work and only current work IDs are exposed", async () => {
  const a = await visit();
  const otherId = Object.keys(a.body.counts).find((id) => id !== workId);
  assert.ok(otherId);
  await put(a.cookie, true);
  await put(a.cookie, true, { workId: otherId });
  await database
    .prepare("INSERT INTO work_likes (work_id, visitor_id) VALUES (?, ?)")
    .bind("removed-work", a.cookie.split("=")[1])
    .run();
  const result = await runtime.dispatchFetch(`${origin}/api/likes`, {
    headers: { Cookie: a.cookie },
  });
  const body = await result.json();
  assert.equal(body.counts[workId], 1);
  assert.equal(body.counts[otherId], 1);
  assert.equal(body.counts["removed-work"], undefined);
  assert.deepEqual(body.liked.sort(), [workId, otherId].sort());
});

test("writes reject other origins, absent sessions, wrong media types and unknown works", async () => {
  const { cookie } = await visit();
  assert.equal(
    (await put(cookie, true, { headers: { Origin: "https://other.test" } }))
      .status,
    403,
  );
  assert.equal(
    (await put(cookie, true, { headers: { Origin: "" } })).status,
    403,
  );
  assert.equal((await put("", true)).status, 409);
  assert.equal((await put("tristanlee_visitor=invalid", true)).status, 409);
  assert.equal(
    (await put(cookie, true, { headers: { "Content-Type": "text/plain" } }))
      .status,
    415,
  );
  assert.equal((await put(cookie, true, { workId: "not-a-work" })).status, 404);
  assert.equal((await visit()).body.counts[workId], 0);
});

test("malformed and oversized requests cannot create likes", async () => {
  const { cookie } = await visit();
  for (const body of [
    "null",
    "[]",
    "{}",
    '{"liked":"true"}',
    '{"liked":true,"extra":1}',
    "{",
  ]) {
    assert.equal((await put(cookie, true, { body })).status, 400);
  }
  assert.equal(
    (
      await put(cookie, true, {
        body: JSON.stringify({ liked: true, padding: "a".repeat(600) }),
      })
    ).status,
    413,
  );
  assert.equal((await visit()).body.counts[workId], 0);
});

test("unsupported methods have explicit Allow headers", async () => {
  const list = await runtime.dispatchFetch(`${origin}/api/likes`, {
    method: "POST",
  });
  assert.equal(list.status, 405);
  assert.equal(list.headers.get("Allow"), "GET");
  const item = await runtime.dispatchFetch(`${origin}/api/likes/${workId}`);
  assert.equal(item.status, 405);
  assert.equal(item.headers.get("Allow"), "PUT");
});

test("storage failures return a generic retryable error without corrupting counts", async () => {
  const { cookie } = await visit();
  await database
    .prepare(
      "CREATE TRIGGER reject_test_like BEFORE INSERT ON work_likes BEGIN SELECT RAISE(ABORT, 'private database failure'); END",
    )
    .run();
  try {
    const response = await put(cookie, true);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), {
      error: "Likes are temporarily unavailable",
    });
    assert.equal((await visit()).body.counts[workId], 0);
  } finally {
    await database.prepare("DROP TRIGGER reject_test_like").run();
  }
});
