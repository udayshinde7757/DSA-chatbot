import { MessageSquare, ArrowUpRight } from "lucide-react";
import { BrandMark } from "./brand";
import { examplePrompts } from "./data";

interface EmptyChatProps {
  onPrompt: (text: string) => void;
}

export function EmptyChat({ onPrompt }: EmptyChatProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass-elevated">
        <BrandMark size={32} />
      </div>
      <h1
        className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: "var(--color-charcoal-100)" }}
      >
        How can I help you think?
      </h1>
      <p
        className="mb-8 max-w-md text-center text-[14px] leading-relaxed"
        style={{ color: "var(--color-charcoal-400)" }}
      >
        Your personal DSA mentor. Ask for an explanation, a walkthrough, or a full-code solution — I
        cover the approach, complexity, and edge cases.
      </p>

      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {examplePrompts.map((p) => (
          <button
            key={p.id}
            className="card card-interactive text-left flex items-center justify-between gap-2"
            style={{ padding: "12px 14px" }}
            onClick={() => onPrompt(p.text)}
          >
            <span className="min-w-0">
              <span
                className="mb-0.5 block text-[10.5px] uppercase tracking-wider"
                style={{ color: "var(--color-ember-400)" }}
              >
                {p.category}
              </span>
              <span
                className="block text-[13px] leading-snug"
                style={{ color: "var(--color-charcoal-200)" }}
              >
                {p.text}
              </span>
            </span>
            <ArrowUpRight
              size={14}
              style={{ color: "var(--color-charcoal-500)" }}
              className="flex-shrink-0"
            />
          </button>
        ))}
      </div>

      <p
        className="mt-8 flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--color-charcoal-600)" }}
      >
        <MessageSquare size={13} />
        You can ask follow-ups — your mentor remembers the whole conversation.
      </p>
    </div>
  );
}
