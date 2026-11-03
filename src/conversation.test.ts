import { expect, it } from "vitest";
import { chatMessages, storedChatChoices } from "./conversation";
import { makeItem } from "./schema";
const record = makeItem({ id: "chat-test", title: "toto", sender: "toto" });
const steps = [
  { line: "toto：到了吗？", choices: [{ label: "到了。", reply: "toto：我看见你了。" }, { label: "再等一下。", reply: "toto：我等你。" }] },
  { line: "toto：想回家吗？", choices: [{ label: "想。", reply: "toto：走吧。" }] },
];
it("reveals only the current prompt and chosen reply", () => {
  expect(chatMessages(record, steps, [], "minlee", "21:42").map((m) => m.body)).toEqual(["到了吗？"]);
  const list = chatMessages(record, steps, ["1"], "minlee", "21:42");
  expect(list.map((m) => m.body)).toEqual(["到了吗？", "再等一下。", "我等你。", "想回家吗？"]);
  expect(list[1].outgoing).toBe(true);
  expect(chatMessages(record, steps, ["1"], "minlee", "21:42", true).map((m) => m.body)).toEqual(["到了吗？", "再等一下。"]);
});
it("restores only choices belonging to the requested conversation", () => {
  expect(storedChatChoices(['["other","0"]', '["chat-test","1"]', "bad", "{}"], "chat-test")).toEqual(["1"]);
});
