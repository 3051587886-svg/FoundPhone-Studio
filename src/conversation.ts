import type { Item } from "./schema";
import { makeItem } from "./schema";
import type { CallStep } from "./callDialogue";
export function chatMessages(record: Item, steps: CallStep[], choices: string[], owner: string, time: string, typing = false): Item[] {
  const result: Item[] = [];
  const incoming = (body: string, id: string) => result.push(makeItem({
    id: record.id + "-" + id, title: record.title, sender: record.sender,
    avatar: record.avatar, body: body.replace(/^[^：:]+[：:]\s*/, ""),
    time, meta: { local: "true" },
  }));
  choices.forEach((selected, index) => {
    const step = steps[index], choice = step?.choices[Number(selected)];
    if (!step || !choice) return;
    incoming(step.line, index + "-prompt");
    result.push(makeItem({ id: record.id + "-" + index + "-owner", title: record.title,
      sender: owner, body: choice.label, outgoing: true, time, meta: { local: "true" } }));
    if (!typing || index < choices.length - 1) incoming(choice.reply, index + "-reply");
  });
  if (!typing && steps[choices.length]) incoming(steps[choices.length].line, choices.length + "-prompt");
  return result;
}
export function storedChatChoices(entries: string[], id: string): string[] {
  return entries.flatMap((raw) => {
    try {
      const entry: unknown = JSON.parse(raw);
      return Array.isArray(entry) && entry.length === 2 && entry[0] === id &&
        typeof entry[1] === "string" ? [entry[1]] : [];
    } catch { return []; }
  });
}
