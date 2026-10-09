import { useEffect, useRef, useState } from "react";

type Step = { kind: "brief" | "tool" | "note" | "done"; tool?: string; text: string };

/** An illustration of an agent working through MCP tools. Not a client project, and the caption says so. */
const steps: Step[] = [
  { kind: "brief", text: "Brief: cut the time it takes to triage support requests." },
  { kind: "tool", tool: "tickets.search", text: "pull last month's requests" },
  { kind: "tool", tool: "docs.read", text: "read the support playbook" },
  { kind: "note", text: "Group requests by cause. Flag the ones a person should answer." },
  { kind: "tool", tool: "tasks.create", text: "draft the plan as tasks" },
  { kind: "done", text: "Plan ready for a person to review." },
];

const marks: Record<Step["kind"], string> = { brief: "›", tool: "→", note: "·", done: "✓" };

const STEP_MS = 950;
const HOLD_MS = 3800;

export function AgentRun() {
  // Every step is shown on the server and without JavaScript. The loop starts only after hydration.
  const [shown, setShown] = useState(steps.length);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setPlaying(Boolean(entry?.isIntersecting)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const done = shown >= steps.length;
    // The first run starts quickly; later runs hold the finished plan on screen before restarting.
    const wait = done ? (started.current ? HOLD_MS : 600) : STEP_MS;
    started.current = true;
    const timer = window.setTimeout(() => setShown(done ? 1 : shown + 1), wait);
    return () => window.clearTimeout(timer);
  }, [playing, shown]);

  const running = playing && shown < steps.length;

  return (
    <figure className="agent-run" ref={ref}>
      <div className="agent-bar" aria-hidden="true">
        <span className="agent-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="agent-title">agent run</span>
        <span className={running ? "agent-status is-running" : "agent-status"}>{running ? "working" : "done"}</span>
      </div>
      <ol className="agent-steps">
        {steps.map((step, index) => (
          <li
            key={step.text}
            className={[`step-${step.kind}`, index < shown ? "" : "is-pending", running && index === shown - 1 ? "is-current" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="step-mark" aria-hidden="true">
              {marks[step.kind]}
            </span>
            <span>
              {step.tool ? <code>{step.tool}</code> : null}
              {step.tool ? " " : null}
              {step.text}
            </span>
          </li>
        ))}
      </ol>
      <figcaption>
        <span className="sq" aria-hidden="true" />
        Illustration · an AI agent using MCP tools
      </figcaption>
    </figure>
  );
}
