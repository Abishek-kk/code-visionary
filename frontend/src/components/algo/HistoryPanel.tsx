import { usePlayback } from "@/stores/playback";

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const LANG_LABEL: Record<string, string> = {
  python: "Py",
  javascript: "JS",
  typescript: "TS",
  java: "Java",
  cpp: "C++",
  go: "Go",
};

export function HistoryPanel() {
  const history = usePlayback((s) => s.history);
  const setLanguage = usePlayback((s) => s.setLanguage);
  const fetchMut = usePlayback((s) => s.setProblem);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="glass flex flex-col gap-2 rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">History</div>
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
        {history.map((item) => (
          <button
            key={item.slug + item.timestamp}
            onClick={() => {
              setLanguage(item.language);
              fetchMut({ slug: item.slug });
            }}
            className="flex w-full flex-col gap-1 rounded-xl border border-border bg-[var(--panel)] p-3 text-left transition-all hover:border-[var(--neon-cyan)]"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{item.title}</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                {timeAgo(item.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--neon-cyan)]">{item.pattern}</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                {LANG_LABEL[item.language] ?? item.language}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
