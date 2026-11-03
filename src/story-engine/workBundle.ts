import { safeMedia, type Work } from "../schema";

type MediaReference = { $foundphoneMedia: number };
type WorkBundle = { bundleVersion: 1; media: string[]; work: unknown };

// Store each embedded image/audio/video once without changing the runtime Work.
export function packWork(work: Work): Work | WorkBundle {
  const media: string[] = [];
  const indexes = new Map<string, number>();
  const encoded: unknown = JSON.parse(JSON.stringify(work, (_key, value: unknown) => {
    if (typeof value !== "string" || !value.startsWith("data:") || !safeMedia(value))
      return value;
    let index = indexes.get(value);
    if (index === undefined) {
      index = media.length;
      indexes.set(value, index);
      media.push(value);
    }
    return { $foundphoneMedia: index } satisfies MediaReference;
  }));
  return media.length ? { bundleVersion: 1, media, work: encoded } : work;
}

export function unpackWork(input: unknown): unknown {
  if (!input || typeof input !== "object" || !("bundleVersion" in input))
    return input;
  const bundle = input as Partial<WorkBundle>;
  if (bundle.bundleVersion !== 1 || !Array.isArray(bundle.media) ||
      !("work" in bundle) ||
      !bundle.media.every((value) => typeof value === "string" && !!safeMedia(value)))
    throw new Error("无效的作品媒体包");
  const media = bundle.media;
  return JSON.parse(JSON.stringify(bundle.work), (_key, value: unknown) => {
    if (!value || typeof value !== "object" || !("$foundphoneMedia" in value))
      return value;
    const reference = value as MediaReference;
    if (Object.keys(reference).length !== 1 ||
        !Number.isInteger(reference.$foundphoneMedia) ||
        reference.$foundphoneMedia < 0 ||
        reference.$foundphoneMedia >= media.length)
      throw new Error("作品媒体引用不存在");
    return media[reference.$foundphoneMedia];
  });
}
