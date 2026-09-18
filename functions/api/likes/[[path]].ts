import { works } from "../../../src/data/site";

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
}

interface D1Result {
  results: Record<string, unknown>[];
}

interface LikesDatabase {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
}

type Context = {
  request: Request;
  env: { LIKES_DB: LikesDatabase };
};

const workIds = new Set(works.map((work) => work.id));
const visitorCookie = "tristanlee_visitor";
const visitorPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxBodyBytes = 512;

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      Vary: "Cookie",
      ...headers,
    },
  });
}

function getVisitor(request: Request) {
  const cookie = request.headers
    .get("Cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${visitorCookie}=`))
    ?.slice(visitorCookie.length + 1);
  return cookie && visitorPattern.test(cookie) ? cookie : null;
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      throw new RangeError("Body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function onRequest({ request, env }: Context): Promise<Response> {
  const url = new URL(request.url);
  const match = /^\/api\/likes(?:\/([^/]+))?\/?$/.exec(url.pathname);
  if (!match) return json({ error: "Not found" }, 404);
  const workId = match[1];
  const allowedMethod = workId ? "PUT" : "GET";
  if (request.method !== allowedMethod) {
    return json({ error: "Method not allowed" }, 405, { Allow: allowedMethod });
  }
  if (workId && !workIds.has(workId)) {
    return json({ error: "Work not found" }, 404);
  }

  try {
    const existingVisitor = getVisitor(request);
    if (!workId) {
      const visitor = existingVisitor ?? crypto.randomUUID();
      const [totals, mine] = await env.LIKES_DB.batch([
        env.LIKES_DB.prepare(
          "SELECT work_id, COUNT(*) AS count FROM work_likes GROUP BY work_id",
        ),
        env.LIKES_DB.prepare(
          "SELECT work_id FROM work_likes WHERE visitor_id = ?",
        ).bind(visitor),
      ]);
      const counts: Record<string, number> = Object.fromEntries(
        [...workIds].map((id) => [id, 0]),
      );
      for (const row of totals.results) {
        const id = String(row.work_id);
        if (workIds.has(id)) counts[id] = Number(row.count);
      }
      const liked = mine.results
        .map((row) => String(row.work_id))
        .filter((id) => workIds.has(id));
      const headers: Record<string, string> = {};
      if (!existingVisitor) {
        headers["Set-Cookie"] =
          `${visitorCookie}=${visitor}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax` +
          (url.protocol === "https:" ? "; Secure" : "");
      }
      return json({ counts, liked }, 200, headers);
    }

    if (request.headers.get("Origin") !== url.origin) {
      return json({ error: "Origin not allowed" }, 403);
    }
    if (!existingVisitor) {
      return json(
        { error: "Visitor session missing; reload and try again" },
        409,
      );
    }
    const contentType = request.headers
      .get("Content-Type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();
    if (contentType !== "application/json") {
      return json({ error: "Expected application/json" }, 415);
    }
    let body: unknown;
    try {
      body = await readBody(request);
    } catch (error) {
      return json(
        {
          error:
            error instanceof RangeError
              ? "Request body too large"
              : "Invalid JSON body",
        },
        error instanceof RangeError ? 413 : 400,
      );
    }
    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body) ||
      !("liked" in body) ||
      typeof body.liked !== "boolean" ||
      Object.keys(body).length !== 1
    ) {
      return json({ error: "Expected a boolean liked value" }, 400);
    }

    // D1 batches are transactional: mutation and returned state share one snapshot.
    const [, total, mine] = await env.LIKES_DB.batch([
      env.LIKES_DB.prepare(
        body.liked
          ? "INSERT INTO work_likes (work_id, visitor_id) VALUES (?, ?) ON CONFLICT (work_id, visitor_id) DO NOTHING"
          : "DELETE FROM work_likes WHERE work_id = ? AND visitor_id = ?",
      ).bind(workId, existingVisitor),
      env.LIKES_DB.prepare(
        "SELECT COUNT(*) AS count FROM work_likes WHERE work_id = ?",
      ).bind(workId),
      env.LIKES_DB.prepare(
        "SELECT 1 AS liked FROM work_likes WHERE work_id = ? AND visitor_id = ?",
      ).bind(workId, existingVisitor),
    ]);
    return json({
      workId,
      count: Number(total.results[0]?.count ?? 0),
      liked: mine.results.length > 0,
    });
  } catch {
    return json({ error: "Likes are temporarily unavailable" }, 503);
  }
}
