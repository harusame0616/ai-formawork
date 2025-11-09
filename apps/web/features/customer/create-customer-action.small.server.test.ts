import { expect, test } from "vitest";
import { createCustomerAction } from "./create-customer-action";

test.each([
	{ description: "引数が undefined", input: undefined },
	{ description: "引数が null", input: null },
	{ description: "引数が数値", input: 123 },
	{ description: "引数が配列", input: [] },
	{ description: "引数が空オブジェクト", input: {} },
	{
		description: "name プロパティが欠けている",
		input: { email: "test@example.com" },
	},
	{
		description: "email プロパティが欠けている",
		input: { name: "Test Customer" },
	},
	{
		description: "name が数値",
		input: { email: "test@example.com", name: 123 },
	},
	{
		description: "email が数値",
		input: { email: 123, name: "Test Customer" },
	},
	{
		description: "name が空文字列",
		input: { email: "test@example.com", name: "" },
	},
	{
		description: "email が空文字列",
		input: { email: "", name: "Test Customer" },
	},
	{
		description: "email がメール形式でない",
		input: { email: "invalid-email", name: "Test Customer" },
	},
	{
		description: "name が101文字（100文字超過）",
		input: {
			email: "test@example.com",
			name: "a".repeat(101),
		},
	},
	{
		description: "email が255文字（254文字超過）",
		input: {
			email: `${"a".repeat(243)}@example.com`, // 243 + 1(@) + 11(example.com) = 255文字
			name: "Test Customer",
		},
	},
])("$description の場合、バリデーションエラーを返す", async ({ input }) => {
	// @ts-expect-error - サーバーアクションは任意の引数で呼び出される可能性がある
	const result = await createCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
