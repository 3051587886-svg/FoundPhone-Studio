import { useEffect, useRef } from "react";
import type { Item, UiValue } from "../schema";
import { parseCallDialogue, validCallHistory } from "../callDialogue";
import "./call-dialogue.css";
export function CallDialogue({ record, history, onHistory }: {
  record: Item; history?: UiValue; onHistory: (value: string[]) => void;
}) {
  const steps = parseCallDialogue(record.meta.callDialogue);
  const choices = steps ? validCallHistory(steps, history) : [];
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [choices.length, record.id]);
  return (
    <div className="call-transcript" role="region" aria-label="通话文字" ref={scroll}>
      {!steps ? <p style={{ whiteSpace: "pre-line" }}>{record.body}</p> : <>
        <div aria-live="polite" aria-atomic="false">
          {choices.map((selected, index) => {
            const step = steps[index], choice = step.choices[Number(selected)];
            return <div key={index}>
              <p className="call-line">{step.line}</p>
              <p className="call-line call-line-owner">minlee：{choice.label}</p>
              <p className="call-line">{choice.reply}</p>
            </div>;
          })}
          {steps[choices.length] ? <p className="call-line">{steps[choices.length].line}</p>
            : <p className="call-done">对话结束，可以挂断了。</p>}
        </div>
        {steps[choices.length] && <div className="call-replies" aria-label="选择回复">
          {steps[choices.length].choices.map((choice, index) =>
            <button key={index} onClick={() => onHistory([...choices, String(index)])}>
              {choice.label}
            </button>)}
        </div>}
      </>}
    </div>
  );
}
