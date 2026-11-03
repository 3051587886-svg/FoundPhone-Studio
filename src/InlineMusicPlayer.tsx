import { useEffect, useRef, useState } from "react";
import { musicEmbed } from "./musicLinks";
import { loadYouTubeAPI } from "./youtubeAPI";
import type { Item } from "./schema";
export function InlineMusicPlayer({ item }: { item: Item }) {
  const mount = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("正在加载，出现播放器后可点播放。");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let player: { destroy(): void; playVideo(): void } | undefined;
    const frame = document.createElement("iframe");
    frame.src = musicEmbed(item.meta.listenUrl, window.location.origin);
    frame.title = "播放" + item.title;
    frame.width = "100%"; frame.height = "220";
    frame.style.border = "0";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    mount.current?.appendChild(frame);
    setMessage("正在加载，出现播放器后可点播放。");
    void loadYouTubeAPI().then((api) => {
      if (!active) return;
      player = new api.Player(frame, { events: {
        onReady: () => { if (active) setMessage("可在这里播放；若未自动开始，请点播放器内的播放键。"); },
        onAutoplayBlocked: () => { if (active) setMessage("请点播放器内的播放键开始收听。"); },
        onError: () => { if (active) setMessage("此歌曲暂时无法在这里播放，可能受地区、网络或视频方权限限制。"); },
      } });
    }).catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : "播放器暂时无法加载。");
    });
    return () => { active = false; player?.destroy(); frame.remove(); };
  }, [item.id, item.title, item.meta.listenUrl, retry]);
  return <section aria-label="歌曲播放器">
    <div ref={mount} style={{ width: "100%", minHeight: 220, background: "#000" }} />
    <p role="status" style={{ fontSize: 12, lineHeight: 1.5, padding: "8px 0" }}>{message}</p>
    <button onClick={() => setRetry((value) => value + 1)}>重新加载播放器</button>
  </section>;
}
