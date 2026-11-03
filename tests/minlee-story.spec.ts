import { test, expect } from "@playwright/test";
import { validateWork } from "../src/schema";
import { packWork, unpackWork } from "../src/story-engine/workBundle";

test("minlee lock, supplied photos and KakaoTalk conversation", async ({ page, request }) => {
  const response = await request.get("/work.json");
  expect(response.ok()).toBe(true);
  const packed = await response.json();
  expect(Buffer.byteLength(JSON.stringify(packed))).toBeLessThan(2 * 1024 * 1024);
  const work = validateWork(unpackWork(packed));
  expect(work.phone.passcode).toBe("0530");
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
  await contact.click();
  await page.getByText("番外篇的新本子你收到没", { exact: false }).scrollIntoViewIfNeeded();
  await expect(page.getByText("番外篇的新本子你收到没", { exact: false })).toBeVisible();
  const reply = page.getByText("你坐过来，我试一次", { exact: false });
  await reply.scrollIntoViewIfNeeded();
  await expect(reply).toBeVisible();
  expect(errors).toEqual([]);
});
