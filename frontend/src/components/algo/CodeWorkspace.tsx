import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Play, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, STARTER_CODE, type LanguageId } from "@/constants/algo-examples";
import { extractLeetCodeSlug } from "@/utils/slug";
import { analyzeCode } from "@/lib/analyze.functions";
import { fetchLeetCodeProblem } from "@/lib/leetcode.functions";
import { usePlayback } from "@/stores/playback";

const monacoLangMap: Record<LanguageId, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  cpp: "cpp",
  go: "go",
};

export function CodeWorkspace() {
  const [isClient, setIsClient] = useState(false);
  const [language, setLanguage] = useState<LanguageId>("python");
  const [code, setCode] = useState(STARTER_CODE.python);
  const [url, setUrl] = useState("");

  const setAnalysis = usePlayback((s) => s.setAnalysis);
  const setProblem = usePlayback((s) => s.setProblem);
  const setIsAnalyzing = usePlayback((s) => s.setIsAnalyzing);

  const analyzeFn = useServerFn(analyzeCode);
  const fetchFn = useServerFn(fetchLeetCodeProblem);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const analyzeMut = useMutation({
    mutationFn: (vars: { code: string; language: LanguageId }) =>
      analyzeFn({ data: vars }),
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success(`Detected pattern: ${data.pattern}`);
    },
    onError: (err: Error) => {
      setIsAnalyzing(false);
      toast.error(err.message || "Analysis failed. Try again.");
    },
  });

  const fetchMut = useMutation({
    mutationFn: (slug: string) => fetchFn({ data: { slug } }),
    onSuccess: (data) => {
      setProblem(data);
      toast.success(`Loaded: ${data.title}`);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Could not load problem."),
  });

  function handleLanguageChange(id: LanguageId) {
    setLanguage(id);
    setCode(STARTER_CODE[id]);
  }

  function handleFetch() {
    const slug = extractLeetCodeSlug(url);
    if (!slug) {
      toast.error("Paste a LeetCode URL or slug, e.g. two-sum");
      return;
    }
    fetchMut.mutate(slug);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="glass flex flex-col gap-2 rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={language} onValueChange={(v) => handleLanguageChange(v as LanguageId)}>
            <SelectTrigger className="h-8 w-[140px] border-border bg-[var(--panel)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setIsAnalyzing(true);
              analyzeMut.mutate({ code, language });
            }}
            disabled={analyzeMut.isPending || code.trim().length < 5}
            className="ml-auto h-8 gap-2 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-pink)] font-semibold text-[var(--primary-foreground)] hover:opacity-90"
          >
            {analyzeMut.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Play className="size-4" /> Analyze
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/two-sum/  or  two-sum"
            className="h-8 bg-[var(--panel)] font-mono text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFetch();
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetch}
            disabled={fetchMut.isPending}
            className="h-8"
          >
            {fetchMut.isPending ? <Loader2 className="size-3 animate-spin" /> : "Load"}
          </Button>
        </div>
      </div>

      <div className="glass relative flex-1 overflow-hidden rounded-2xl">
        {isClient ? (
          <Editor
            height="100%"
            theme="vs-dark"
            language={monacoLangMap[language]}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{
              fontFamily:
                'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 },
              lineNumbersMinChars: 3,
              renderLineHighlight: "all",
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            Loading editor...
          </div>
        )}
      </div>
    </div>
  );
}
