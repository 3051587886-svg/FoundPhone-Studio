import { describe, expect, it } from "vitest";
import source from "../../stories/template/story.json";
import { compileStory } from "./compiler";
import { testStory } from "./testStory";
import { advance, dispatch } from "../engine";
import { initialRuntime } from "../schema";

describe("minlee story", () => {
  const { story, work } = compileStory(source);
  it("validates both phone paths and preserves the password", () => {
    expect(testStory(story, work)).toEqual([]);
    expect(work.phone.passcode).toBe("0530");
  });
  it("rings after 2000ms only for toto, and only once per save", () => {
    let state = dispatch(work, initialRuntime(work), "start");
    expect(state.notifications).toEqual([
      "KakaoTalk：toto：你在哪呢，我来接你",
      "KakaoTalk：toto：好想你",
    ]);
    state = dispatch(work, state, "openApp", "kakao");
    state = dispatch(work, state, "read", "kakao-colleague-1");
    state = advance(work, state, 3000);
    expect(state.incomingCall).toBeNull();
    state = dispatch(work, state, "read", "kakao-toto-01");
    state = advance(work, state, 1999);
    expect(state.incomingCall).toBeNull();
    state = advance(work, state, 1);
    expect(state.incomingCall).toEqual({ caller: "toto", target: "toto-voice-call", status: "ringing" });
    state = dispatch(work, { ...state, incomingCall: null }, "callDeclined", "toto-voice-call");
    state = advance(work, dispatch(work, state, "read", "kakao-toto-01"), 3000);
    expect(state.incomingCall).toBeNull();
  });
  it("keeps the two formal chats and the reference profile", () => {
    for (const title of ["同事", "老板"]) {
      const messages = work.data.kakao.filter((item) => item.title === title);
      expect(messages).toHaveLength(2);
      expect(messages[0].avatar).toBe("");
    }
    const profile = work.data.instagram.find((item) => item.folder === "个人资料");
    expect(profile?.meta).toMatchObject({ handle: "mii.iin_", posts: "116", followers: "61.2万", following: "100" });
  });
});
