import type { Item } from "./schema";
import { musicLink } from "./musicLinks";
export function MusicLink({ item }: { item: Item }) {
  const href = musicLink(item.meta.listenUrl);
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
      aria-label={`收听${item.title}`}
      style={{ color: "inherit", textDecoration: "underline", fontSize: 12, padding: "8px 4px", whiteSpace: "nowrap" }}>
      YouTube 收听 ↗
    </a>
  ) : null;
}
