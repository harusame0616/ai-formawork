import { expect, test } from "vitest";
import { updateCustomerAction } from "./update-customer-action";

test.each([
	{ description: "引数が undefined", input: undefined },
	{ description: "引数が null", input: null },
	{ description: "引数が数値", input: 123 },
	{ description: "引数が配列", input: [] },
	{ description: "引数が空オブジェクト", input: {} },
	{
		description: "customerId プロパティが欠けている",
		input: { email: "test@example.com", name: "テスト太郎" },
	},
	{
		description: "name プロパティが欠けている",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
		},
	},
	{
		description: "email プロパティが欠けている",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			name: "テスト太郎",
		},
	},
	{
		description: "customerId がUUID形式でない",
		input: {
			customerId: "invalid-uuid",
			email: "test@example.com",
			name: "テスト太郎",
		},
	},
	{
		description: "name が数値",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			name: 123,
		},
	},
	{
		description: "email が数値",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: 123,
			name: "テスト太郎",
		},
	},
	{
		description: "name が空文字列",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			name: "",
		},
	},
	{
		description: "email が空文字列",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: "",
			name: "テスト太郎",
		},
	},
	{
		description: "email がメール形式でない",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: "invalid-email",
			name: "テスト太郎",
		},
	},
	{
		description: "name が101文字（100文字超過）",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			name: "あ".repeat(101),
		},
	},
	{
		description: "email が255文字（254文字超過）",
		input: {
			customerId: "123e4567-e89b-12d3-a456-426614174000",
			email: `${"a".repeat(243)}@example.com`, // 243 + 1(@) + 11(example.com) = 255文字
			name: "テスト太郎",
		},
	},
])("$description の場合、バリデーションエラーを返す", async ({ input }) => {
	// @ts-expect-error - サーバーアクションは任意の引数で呼び出される可能性がある
	const result = await updateCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
