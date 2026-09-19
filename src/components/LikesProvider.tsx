import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Heart } from "lucide-react";

type Snapshot = { counts: Record<string, number>; liked: string[] };
type LikesState = {
  snapshot: Snapshot;
  ready: boolean;
  loading: boolean;
  pending: Set<string>;
  errors: Record<string, string>;
  toggle: (id: string) => Promise<void>;
};
const LikesContext = createContext<LikesState | null>(null);
class LikesRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("点赞暂未连接，请稍后重试");
    this.status = status;
  }
}
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...options,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new LikesRequestError(response.status);
  return response.json() as Promise<T>;
}
export function LikesProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>({ counts: {}, liked: [] });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const current = useRef(snapshot);
  const pendingIds = useRef(new Set<string>());
  const revision = useRef(0);
  const refreshRequest = useRef<Promise<Snapshot> | null>(null);
  const refresh = useCallback(() => {
    if (refreshRequest.current) return refreshRequest.current;
    const started = revision.current;
    const promise = request<Snapshot>("/api/likes")
      .then((data) => {
        if (
          !data.counts ||
          !Object.values(data.counts).every(
            (count) => Number.isSafeInteger(count) && count >= 0,
          ) ||
          !Array.isArray(data.liked) ||
          !data.liked.every((id) => typeof id === "string")
        )
          throw new Error("Invalid likes response");
        if (started === revision.current && pendingIds.current.size === 0) {
          current.current = data;
          setSnapshot(data);
          setReady(true);
          setErrors({});
        }
        return data;
      })
      .finally(() => {
        refreshRequest.current = null;
        setLoading(false);
      });
    refreshRequest.current = promise;
    return promise;
  }, []);
  useEffect(() => {
    const sync = () => {
      if (!document.hidden && pendingIds.current.size === 0)
        void refresh().catch(() => {});
    };
    sync();
    const timer = window.setInterval(sync, 30000);
    window.addEventListener("focus", sync);
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", sync);
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [refresh]);
  const apply = (id: string, liked: boolean, count: number) => {
    const old = current.current;
    const next = {
      counts: { ...old.counts, [id]: count },
      liked: liked
        ? [...old.liked.filter((key) => key !== id), id]
        : old.liked.filter((key) => key !== id),
    };
    current.current = next;
    setSnapshot(next);
  };
  const toggle = async (id: string) => {
    if (pendingIds.current.has(id)) return;
    setErrors((old) => ({ ...old, [id]: "" }));
    pendingIds.current.add(id);
    setPending(new Set(pendingIds.current));
    revision.current++;
    let previous: { liked: boolean; count: number } | undefined;
    try {
      if (!ready) {
        const data = await refresh();
        current.current = data;
        setSnapshot(data);
        setReady(true);
      }
      previous = {
        liked: current.current.liked.includes(id),
        count: current.current.counts[id] ?? 0,
      };
      const desired = !previous.liked;
      apply(id, desired, Math.max(0, previous.count + (desired ? 1 : -1)));
      const save = () =>
        request<{ count: number; liked: boolean }>(
          `/api/likes/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ liked: desired }),
          },
        );
      let result;
      try {
        result = await save();
      } catch (error) {
        if (!(error instanceof LikesRequestError) || error.status !== 409)
          throw error;
        // A cleared or expired visitor cookie needs a new session before PUT.
        // Keep the user's intended state and avoid changing other pending likes.
        const data = await refresh();
        previous = {
          liked: data.liked.includes(id),
          count: data.counts[id] ?? 0,
        };
        apply(
          id,
          desired,
          Math.max(
            0,
            previous.count + (Number(desired) - Number(previous.liked)),
          ),
        );
        result = await save();
      }
      if (
        !Number.isSafeInteger(result.count) ||
        result.count < 0 ||
        typeof result.liked !== "boolean"
      )
        throw new Error("Invalid likes response");
      apply(id, result.liked, result.count);
    } catch {
      if (previous) apply(id, previous.liked, previous.count);
      setErrors((old) => ({ ...old, [id]: "点赞未保存，请点击重试" }));
    } finally {
      pendingIds.current.delete(id);
      revision.current++;
      setPending(new Set(pendingIds.current));
    }
  };
  return (
    <LikesContext.Provider
      value={{ snapshot, ready, loading, pending, errors, toggle }}
    >
      {children}
    </LikesContext.Provider>
  );
}
export function LikeButton({ id, title }: { id: string; title: string }) {
  const state = useContext(LikesContext);
  if (!state) throw new Error("LikeButton requires LikesProvider");
  const liked = state.snapshot.liked.includes(id),
    count = state.snapshot.counts[id] ?? 0;
  const pending = state.pending.has(id),
    error = state.errors[id];
  return (
    <span className="like-control">
      <button
        type="button"
        className={`like-button ${liked ? "is-liked" : ""}`}
        aria-pressed={liked}
        aria-busy={pending}
        aria-label={`${liked ? "取消点赞" : "点赞"}${title}，${state.ready ? `${count} 人点赞` : state.loading ? "正在连接点赞服务" : "点击重新连接点赞服务"}`}
        disabled={pending || state.loading}
        onClick={() => void state.toggle(id)}
        title={
          error || (!state.ready ? "点击重新连接点赞服务" : `${count} 人点赞`)
        }
      >
        <Heart strokeWidth={1.7} aria-hidden="true" />
        <span className="like-count" aria-live="polite">
          {state.ready ? count.toLocaleString() : "—"}
        </span>
      </button>
      {error && (
        <span className="like-error" role="status">
          {error}
        </span>
      )}
    </span>
  );
}
