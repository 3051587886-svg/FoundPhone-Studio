import { test, expect } from "@playwright/test";
import { validateWork } from "../src/schema";
import { packWork, unpackWork } from "../src/story-engine/workBundle";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
test.describe(`minlee player at ${viewport.width}px`, () => {
  test.use({ viewport, hasTouch: viewport.width < 500, isMobile: viewport.width < 500 });
  test("minlee lock, supplied photos and KakaoTalk conversation", async ({ page, request }) => {
  const response = await request.get("/work.json");
  expect(response.ok()).toBe(true);
  const packed = await response.json();
  expect(Buffer.byteLength(JSON.stringify(packed))).toBeLessThan(2 * 1024 * 1024);
  const work = validateWork(unpackWork(packed));
  expect(work.phone.passcode).toBe("0530");
  expect(work.data.notes.some((note) => note.title === "手机里的我")).toBe(false);
  expect(JSON.stringify(work)).not.toContain("围读");
  const avatar = work.data.kakao.find((message) => !message.outgoing)?.avatar;
  expect(avatar).toMatch(/^data:image\/jpeg;base64,/);
  // Put KakaoTalk on the first page to isolate this test from launcher pagination.
  const apps = [...work.apps].sort((a, b) => Number(b.id === "kakao") - Number(a.id === "kakao"));
  await page.route("**/work.json", (route) => route.fulfill({ json: packWork({ ...work, apps }) }));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const screen = page.locator(".phone-screen");
  await expect(page.getByRole("button", { name: "轻触解锁" })).toBeVisible();
  expect(await screen.evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain(work.phone.wallpaper);
  expect(await page.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return image.naturalWidth;
  }, work.phone.wallpaper)).toBeGreaterThan(0);
  await expect(page.locator(".device-notice")).toContainText("好想你");
  await page.getByRole("button", { name: "2 条通知", exact: true }).click();
  await expect(page.getByText("toto：你在哪呢，我来接你", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of "0000") await page.getByRole("button", { name: "密码键" + digit, exact: true }).click();
  await expect(page.getByText("密码不正确", { exact: true })).toBeVisible();
  for (const digit of "0530") await page.getByRole("button", { name: "密码键" + digit, exact: true }).click();
  await expect(page.locator(".device-lock")).toHaveCount(0);
  await page.getByRole("button", { name: "打开KakaoTalk", exact: true }).click();
  const contact = page.locator(".kzkcr").filter({ hasText: "toto" });
  await expect(contact).toBeVisible();
  await expect(contact.locator("img")).toHaveAttribute("src", avatar!);
  await expect.poll(() => contact.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  for (const name of ["同事", "老板"]) {
    const row = page.locator(".kzkcr").filter({ hasText: name });
    await expect(row.locator(".kzkn b")).toHaveText(name);
    await row.click();
    await expect(page.locator(".kzbub")).toHaveCount(6);
    await page.waitForTimeout(2200);
    await expect(page.locator(".incoming-call-screen")).toHaveCount(0);
    await page.getByRole("button", { name: "返回", exact: true }).click();
  }
  await contact.click();
  await expect(page.locator(".incoming-call-screen")).toBeVisible({ timeout: 4000 });
  await expect(page.locator(".incoming-call-screen h2")).toHaveText("toto");
  await page.getByRole("button", { name: "接听", exact: true }).click();
  await expect(page.locator(".incoming-call-screen small")).toContainText("通话中");
  const dialogue = page.getByRole("region", { name: "通话文字" });
  await expect(dialogue).toContainText("哥，你在哪呢");
  await expect(dialogue).not.toContainText("就是有点想你");
  await dialogue.getByRole("button", { name: "在楼下，刚出来。", exact: true }).click();
  await expect(dialogue).toContainText("外面有风");
  await dialogue.getByRole("button", { name: "还没，等你一起。", exact: true }).click();
  await expect(dialogue).toContainText("就是有点想你");
  await dialogue.getByRole("button", { name: "那你快点来。", exact: true }).click();
  await expect(dialogue).toContainText("我马上就到了");
  await expect(dialogue.getByRole("button")).toHaveCount(0);
  await page.getByRole("button", { name: "挂断", exact: true }).click();
  await page.getByText("那等我回来一起吃", { exact: false }).scrollIntoViewIfNeeded();
  await expect(page.getByText("那等我回来一起吃", { exact: false })).toBeVisible();
  const reply = page.getByText("好。我帮你留一份，不急。", { exact: false });
  await reply.scrollIntoViewIfNeeded();
  await expect(reply).toBeVisible();
  expect(errors).toEqual([]);
});

test("Instagram reference profile", async ({ page, request }) => {
  const work = validateWork(unpackWork(await (await request.get("/work.json")).json()));
  const apps = [...work.apps].sort((a, b) => Number(b.id === "instagram") - Number(a.id === "instagram"));
  await page.route("**/work.json", (route) => route.fulfill({ json: packWork({ ...work, apps }) }));
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of "0530") await page.getByRole("button", { name: "密码键" + digit, exact: true }).click();
  await page.getByRole("button", { name: "打开Instagram", exact: true }).click();
  await page.getByRole("button", { name: "个人主页", exact: true }).click();
  const profile = page.locator(".mymy-instagram");
  await expect(profile.locator(".igl2")).toHaveText("mii.iin_");
  await expect(profile.locator(".ps")).toContainText("116");
  await expect(profile.locator(".ps")).toContainText("61.2万");
  await expect(profile.locator(".ps")).toContainText("100");
  await expect(profile.locator(".pn")).toContainText("MINLEE");
  await expect(profile.locator(".ig-profile-bio")).toContainText("🍀ENFP");
  await expect(profile.locator(".pg2 button")).toHaveCount(4);
});

test("music apps expose listen links", async ({ page, request }) => {
  const work = validateWork(unpackWork(await (await request.get("/work.json")).json()));
  const apps = [...work.apps].sort((a, b) => Number(["music", "spotify", "netease"].includes(b.id)) - Number(["music", "spotify", "netease"].includes(a.id)));
  await page.route("**/work.json", (route) => route.fulfill({ json: packWork({ ...work, apps }) }));
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of "0530") await page.getByRole("button", { name: "密码键" + digit, exact: true }).click();
  for (const name of ["音乐", "Spotify", "网易云音乐"]) {
    await page.getByRole("button", { name: "打开" + name, exact: true }).click();
    await page.getByRole("button").filter({ hasText: "Ditto" }).first().click();
    const link = page.getByRole("link", { name: "收听Ditto", exact: true });
    await expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=pSUydWEqKwE");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await page.getByRole("button", { name: "返回桌面", exact: true }).click();
  }
});

});
}
