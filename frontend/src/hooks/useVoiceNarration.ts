import { useEffect, useRef } from "react";

export function useVoiceNarration(
  text: string | undefined,
  enabled: boolean
) {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled || !text) return;
    const synth = synthRef.current;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    synth.speak(utterance);
    return () => {
      synth.cancel();
    };
  }, [text, enabled]);
}
