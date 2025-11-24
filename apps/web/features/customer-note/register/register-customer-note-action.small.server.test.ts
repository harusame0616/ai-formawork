import { expect, test, vi } from "vitest";
import { registerCustomerNoteAction } from "./register-customer-note-action";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

test.each([
	{
		description: "引数が undefined",
		input: undefined,
	},
	{
		description: "引数が null",
		input: null,
	},
	{
		description: "引数が数値",
		input: 123,
	},
	{
		description: "引数が配列",
		input: [],
	},
	{
		description: "引数が空オブジェクト",
		input: {},
	},
	{
		description: "content プロパティが欠けている",
		input: {
			customerId: "00000000-0000-0000-0000-000000000001",
		},
	},
	{
		description: "customerId プロパティが欠けている",
		input: {
			content: "テストノート",
		},
	},
	{
		description: "content が数値",
		input: {
			content: 123,
			customerId: "00000000-0000-0000-0000-000000000001",
		},
	},
	{
		description: "customerId が数値",
		input: {
			content: "テストノート",
			customerId: 123,
		},
	},
	{
		description: "content が空文字列",
		input: {
			content: "",
			customerId: "00000000-0000-0000-0000-000000000001",
		},
	},
	{
		description: "customerId が空文字列",
		input: {
			content: "テストノート",
			customerId: "",
		},
	},
	{
		description: "customerId がUUID形式でない",
		input: {
			content: "テストノート",
			customerId: "invalid-uuid",
		},
	},
	{
		description: "content が4097文字（最大値4096を超過）",
		input: {
			content: "あ".repeat(4097),
			customerId: "00000000-0000-0000-0000-000000000001",
		},
	},
])("$description の場合、バリデーションエラーを返す", async ({ input }) => {
	// @ts-expect-error - サーバーアクションは任意の引数で呼び出される可能性がある
	const result = await registerCustomerNoteAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
