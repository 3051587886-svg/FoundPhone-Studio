import { describe, expect, it } from "vitest";
import { musicLink } from "./musicLinks";
import { parseCallDialogue, validCallHistory } from "./callDialogue";
describe("external music links", () => {
  it("allows only HTTPS YouTube watch links and canonicalizes query parameters", () => {
    expect(musicLink("https://www.youtube.com/watch?v=pSUydWEqKwE&feature=share")).toBe("https://www.youtube.com/watch?v=pSUydWEqKwE");
    for (const link of ["javascript:alert(1)", "https://www.youtube.com.evil.test/watch?v=pSUydWEqKwE", "http://www.youtube.com/watch?v=pSUydWEqKwE", "https://user:pass@www.youtube.com/watch?v=pSUydWEqKwE", "https://www.youtube.com/watch?v=invalid", undefined]) expect(musicLink(link)).toBe("");
  });
});
describe("interactive call data", () => {
  const steps = [{ line: "toto：到了吗？", choices: [{ label: "到了。", reply: "toto：我看见你了。" }, { label: "等一下。", reply: "toto：不急。" }] }];
  it("parses safe data and retains only valid sequential choices", () => {
    expect(parseCallDialogue(JSON.stringify(steps))).toEqual(steps);
    expect(validCallHistory(steps, ["1"])).toEqual(["1"]);
    expect(validCallHistory(steps, ["3", "0"])).toEqual([]);
    expect(validCallHistory(steps, ["0", "1"])).toEqual(["0"]);
    expect(validCallHistory(steps, "0")).toEqual([]);
  });
  it("ignores invalid scripts and missing fields", () => {
    for (const script of ["alert(1)", "{}", "[]", JSON.stringify([{ line: "hello", choices: [] }]), JSON.stringify([{ line: "hello", choices: [{ label: "hi" }] }]), undefined]) expect(parseCallDialogue(script)).toBeNull();
  });
});
