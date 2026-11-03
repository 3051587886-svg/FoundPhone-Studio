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
