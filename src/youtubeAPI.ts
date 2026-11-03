type Player = { destroy(): void; playVideo(): void };
type Events = { onReady?: () => void; onError?: (event: { data: number }) => void; onAutoplayBlocked?: () => void };
export type YouTubeAPI = { Player: new (frame: HTMLIFrameElement, options: { events: Events }) => Player };
declare global {
  interface Window { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void }
}
let pending: Promise<YouTubeAPI> | undefined;
export function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise<YouTubeAPI>((resolve, reject) => {
    const script = document.createElement("script");
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => {
      script.remove(); pending = undefined; reject(new Error("播放器加载超时，请检查网络后重试。"));
    }, 12000);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else { pending = undefined; reject(new Error("播放器暂时无法加载。")); }
    };
    script.onerror = () => {
      window.clearTimeout(timeout); script.remove(); pending = undefined;
      reject(new Error("播放器暂时无法加载，请检查网络后重试。"));
    };
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return pending;
}
