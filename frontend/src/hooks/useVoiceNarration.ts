import { useEffect, useRef } from "react";

export function useVoiceNarration(text: string | undefined, enabled: boolean) {
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    if (!enabled || !text) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    synthRef.current.speak(utterance);
    return () => {
      synthRef.current.cancel();
    };
  }, [text, enabled]);
}
