export function musicLink(value: string | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "www.youtube.com" ||
        url.pathname !== "/watch" || url.username || url.password || url.port ||
        !/^[a-zA-Z0-9_-]{11}$/.test(url.searchParams.get("v") || "")) return "";
    return "https://www.youtube.com/watch?v=" + url.searchParams.get("v");
  } catch { return ""; }
}

export function musicEmbed(value: string | undefined, origin: string): string {
  const link = musicLink(value);
  if (!link) return "";
  let host: URL;
  try { host = new URL(origin); } catch { return ""; }
  if (!["https:", "http:"].includes(host.protocol)) return "";
  const id = new URL(link).searchParams.get("v");
  return "https://www.youtube.com/embed/" + id +
    "?playsinline=1&autoplay=1&enablejsapi=1&rel=0&origin=" + encodeURIComponent(host.origin);
}
