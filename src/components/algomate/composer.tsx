import { Send, Square } from "lucide-react";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
  disabled?: boolean;
}

export function Composer({ onSend, onStop, busy, disabled = false }: ComposerProps) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const autosize = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
    const ta = taRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="composer">
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autosize();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask about any DSA concept, problem, or pattern…"
        rows={1}
        aria-label="Message your AI mentor"
        disabled={disabled}
      />
      {busy ? (
        <button
          type="button"
          className="composer-send"
          onClick={onStop}
          aria-label="Stop generating"
          title="Stop generating"
          style={{ background: "var(--color-charcoal-600)", color: "var(--color-charcoal-300)" }}
        >
          <Square size={15} fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          className="composer-send"
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      )}
    </div>
  );
}
