import { describe, expect, it } from "vitest";
import { compileStory } from "./compiler";
import { packWork, unpackWork } from "./workBundle";
import { validateWork } from "../schema";

const photo = "data:image/jpeg;base64,/9j/2Q==";
function sample(withMedia = true) {
  return compileStory({
    scriptVersion: 1, id: "bundle-test", title: "媒体测试",
    phone: { owner: "minlee", ...(withMedia ? { wallpaper: photo } : {}) },
    installedApps: ["kakao", "contacts"],
    contacts: [{ id: "toto", name: "toto", avatar: withMedia ? photo : "" }],
    chats: [{
      id: "kakao-toto", app: "kakao", title: "toto",
      participants: ["owner", "toto"],
      messages: [
        { id: "toto-one", senderId: "toto", body: "回来吃饭" },
        { id: "toto-two", senderId: "toto", body: "早餐做好了" },
      ],
    }],
  }).work;
}
describe("embedded media bundles", () => {
  it("stores repeated media once and restores a valid identical Work", () => {
    const work = sample();
    const before = JSON.stringify(work);
    const packed = packWork(work);
    const serialized = JSON.stringify(packed);
    expect(serialized.split(photo)).toHaveLength(2);
    expect(JSON.stringify(work)).toBe(before);
    const restored = validateWork(unpackWork(JSON.parse(serialized)));
    expect(restored).toEqual(work);
    expect(restored.data.kakao.every((message) => message.avatar === photo)).toBe(true);
    expect(restored.phone.wallpaper).toBe(photo);
  });
  it("retains legacy and media-free works", () => {
    const work = sample(false);
    expect(packWork(work)).toBe(work);
    expect(unpackWork(work)).toBe(work);
  });
  it("rejects unsupported bundles and unsafe media", () => {
    expect(() => unpackWork({ bundleVersion: 2, media: [], work: {} })).toThrow();
    expect(() => unpackWork({ bundleVersion: 1, media: ["https://example.com/a.jpg"], work: {} })).toThrow();
    expect(() => unpackWork({ bundleVersion: 1, media: ["data:text/html;base64,PGgxPg=="], work: {} })).toThrow();
    expect(() => unpackWork({ bundleVersion: 1, media: [] })).toThrow();
  });
  it("rejects missing, fractional, negative and ambiguous media references", () => {
    for (const reference of [
      { $foundphoneMedia: 1 }, { $foundphoneMedia: -1 },
      { $foundphoneMedia: 0.5 }, { $foundphoneMedia: "0" },
      { $foundphoneMedia: 0, extra: true },
    ]) {
      expect(() => unpackWork({
        bundleVersion: 1, media: [photo], work: { avatar: reference },
      })).toThrow();
    }
  });
});
