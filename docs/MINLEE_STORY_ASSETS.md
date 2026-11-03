# minlee story media

The author supplied these photographs in the editing request and selected their use in this story:

- p1: `IMG_4628.jpeg`, used unchanged as the phone wallpaper, embedded as a JPEG data URL in `stories/template/story.json`.
- p2: `IMG_5348.jpeg`, used unchanged as the KakaoTalk contact `toto` avatar, embedded as a JPEG data URL in the same story file. The existing avatar component handles display framing.

These are author-provided third-party photographs, not project-created MIT assets. Their copyright remains with their respective rights holders. No independent permission or license documentation was provided, and this record does not relicense them or assert clearance for further redistribution. The project's existing MIT license and brand/dependency notices remain unchanged.

The story, messages and schedules are fictional. No real account credentials, phone numbers or private messages are included. The fictional phone's `0530` passcode is a story interaction, not a security boundary.

## Build representation and compatibility

The story compiler still produces the existing Work formatVersion 1. To avoid repeating the same full-resolution avatar in every chat message, the production build packs embedded media into a `bundleVersion: 1` envelope with one `media` table and a `work` payload. Media values in the payload are represented by `{ "$foundphoneMedia": index }`. The runtime restores only validated embedded media before calling `validateWork`; no remote URLs or executable imports are allowed.

Legacy raw Work JSON remains supported unchanged. Media-free default/blank/test works retain their original representation. To read a bundled `work.json` in another tool, use `unpackWork` from `src/story-engine/workBundle.ts` before `validateWork`. Source story files and the Work schema do not change. Packing does not change IDs or runtime save format; this story uses revision 4 so earlier test/story saves restart as already handled by the existing player. Preset wallpapers continue to use their existing CSS classes, and photo wallpapers accept safe image data only.
