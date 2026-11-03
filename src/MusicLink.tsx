import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Item } from "./schema";
import { musicLink } from "./musicLinks";
import { InlineMusicPlayer } from "./InlineMusicPlayer";
export function MusicLink({ item }: { item: Item }) {
  const button = useRef<HTMLButtonElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const href = musicLink(item.meta.listenUrl);
  return href ? <>
    <button ref={button} aria-label={`站内播放${item.title}`}
      onClick={() => setTarget(button.current?.closest<HTMLElement>(".phone-screen") || document.body)}>
      站内播放
    </button>
    {target && createPortal(
      <div className="inline-music-overlay" role="dialog" aria-modal="true" aria-label={`正在播放 ${item.title}`}
        style={{ position: "absolute", inset: 0, zIndex: 2000, background: "#101319", color: "white", padding: "70px 18px 28px", overflowY: "auto" }}>
        <button aria-label="关闭播放器" onClick={() => { setTarget(null); button.current?.focus(); }}
          style={{ float: "right", padding: 12 }}>关闭</button>
        <h2 style={{ margin: "12px 0 4px", fontSize: 22 }}>{item.title}</h2>
        <p style={{ marginBottom: 20, opacity: .7 }}>{item.sender}</p>
        <InlineMusicPlayer key={item.id} item={item} />
      </div>, target)}
  </> : null;
}
