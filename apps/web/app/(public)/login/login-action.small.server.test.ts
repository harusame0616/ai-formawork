import { expect, test } from "vitest";
import { loginAction } from "./login-action";

test.each([
	{ description: "引数が undefined", input: undefined },
	{ description: "引数が null", input: null },
	{ description: "引数が数値", input: 123 },
	{ description: "引数が配列", input: [] },
	{ description: "引数が空オブジェクト", input: {} },
	{
		description: "username プロパティが欠けている",
		input: { password: "Test@Pass123" },
	},
	{
		description: "password プロパティが欠けている",
		input: { username: "test@example.com" },
	},
	{
		description: "username が数値",
		input: { password: "Test@Pass123", username: 123 },
	},
	{
		description: "password が数値",
		input: { password: 123, username: "test@example.com" },
	},
	{
		description: "username が空文字列",
		input: { password: "Test@Pass123", username: "" },
	},
	{
		description: "username がメール形式でない",
		input: { password: "Test@Pass123", username: "invalid-email" },
	},
	{
		description: "password が空文字列",
		input: { password: "", username: "test@example.com" },
	},
	{
		description: "username が255文字（254文字超過）",
		input: {
			password: "Test@Pass123",
			username: `${"a".repeat(243)}@example.com`, // 243 + 1(@) + 11(example.com) = 255文字
		},
	},
	{
		description: "password が65文字（64文字超過）",
		input: {
			password: "a".repeat(65),
			username: "test@example.com",
		},
	},
])("$description の場合、バリデーションエラーを返す", async ({ input }) => {
	// @ts-expect-error - サーバーアクションは任意の引数で呼び出される可能性がある
	const result = await loginAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
