import { expect, test } from "@playwright/test";

const staticAssets = [
	"/favicon.ico",
	"/manifest.webmanifest",
	"/icon-192x192.png",
	"/icon-512x512.png",
	"/apple-touch-icon.png",
	"/apple-touch-icon-120x120.png",
	"/apple-touch-icon-120x120-precomposed.png",
	"/apple-touch-icon-precomposed.png",
];

for (const asset of staticAssets) {
	test(`${asset} に認証なしでアクセスできる`, async ({ request }) => {
		const response = await request.get(asset);
		expect(response.status()).toBe(200);
	});
}
