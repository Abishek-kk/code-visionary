import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Play, Link2, Share2 } from "lucide-react";
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
  const [hydrated, setHydrated] = useState(false);
  const [url, setUrl] = useState("");

  const language = usePlayback((s) => s.language);
  const code = usePlayback((s) => s.code);
  const testCase = usePlayback((s) => s.testCase);
  const stepIndex = usePlayback((s) => s.stepIndex);
  const analysis = usePlayback((s) => s.analysis);
  const setLanguage = usePlayback((s) => s.setLanguage);
  const setCode = usePlayback((s) => s.setCode);
  const setTestCase = usePlayback((s) => s.setTestCase);
  const setAnalysis = usePlayback((s) => s.setAnalysis);
  const setProblem = usePlayback((s) => s.setProblem);
  const setIsAnalyzing = usePlayback((s) => s.setIsAnalyzing);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const analyzeFn = useServerFn(analyzeCode);
  const fetchFn = useServerFn(fetchLeetCodeProblem);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize with default code if empty after hydration
  useEffect(() => {
    const unsubscribe = usePlayback.subscribe(
      (state) => state.code,
      () => {
        setHydrated(true);
      },
    );
    return unsubscribe;
  }, []);

  // Set default code for language if code is empty
  useEffect(() => {
    if (hydrated && !code && language) {
      setCode(STARTER_CODE[language as LanguageId]);
    }
  }, [hydrated, code, language, setCode]);

  useEffect(() => {
    const editor = editorRef.current;
    const step = analysis?.steps[stepIndex];
    if (!editor || !step?.lineNumber) return;

    editor.deltaDecorations(
      [],
      [
        {
          range: new (window as any).monaco.Range(step.lineNumber, 1, step.lineNumber, 1),
          options: {
            isWholeLine: true,
            className: "monaco-executing-line",
            glyphMarginClassName: "monaco-executing-glyph",
          },
        },
      ],
    );

    editor.revealLineInCenter(step.lineNumber);
  }, [stepIndex, analysis]);

  const analyzeMut = useMutation({
    mutationFn: (vars: { code: string; language: LanguageId; testCase?: string }) =>
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

  const setIsFetchingProblem = usePlayback((s) => s.setIsFetchingProblem);

  const fetchMut = useMutation({
    mutationFn: (slug: string) => fetchFn({ data: { slug } }),
    onMutate: () => setIsFetchingProblem(true),
    onSuccess: (data) => {
      setProblem(data);
      setIsFetchingProblem(false);
      toast.success(`Loaded: ${data.title}`);
    },
    onError: (err: Error) => {
      setIsFetchingProblem(false);
      toast.error(err.message || "Could not load problem.");
    },
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
              if (!code || code.trim().length < 10) {
                toast.error(
                  "Please paste a valid code solution (at least 10 characters) before analyzing.",
                );
                return;
              }
              if (code.trim().split("\n").length < 2) {
                toast.error("Your code seems too short. Paste a complete LeetCode solution.");
                return;
              }
              setIsAnalyzing(true);
              analyzeMut.mutate({ code, language, testCase });
            }}
            disabled={analyzeMut.isPending || code.trim().length < 10}
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
            Test Input
          </span>
          <Input
            value={testCase}
            onChange={(e) => setTestCase(e.target.value)}
            placeholder="e.g. nums=[2,7,11,15], target=9"
            className="h-8 bg-[var(--panel)] font-mono text-xs"
          />
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
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
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
