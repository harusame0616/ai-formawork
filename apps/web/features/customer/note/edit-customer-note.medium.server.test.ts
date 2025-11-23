import { expect, test, vi } from "vitest";
import { UserRole } from "../../../lib/auth/get-user-role";
import { editCustomerNote } from "./edit-customer-note";

// Loggerをモック
vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

test("管理者ではない別ユーザーが他人のノートを編集しようとした場合にエラーが返される", async () => {
	// seed データの最初のノート（staffId: 00000000-0000-0000-0000-000000000001 が作成）
	const noteId = "10000000-0000-0000-0000-000000000001";

	// 別ユーザー（staffId: 00000000-0000-0000-0000-000000000002）で編集を試みる
	const result = await editCustomerNote({
		content: "編集後の内容",
		customerNoteId: noteId,
		uploadImages: [],
		user: {
			role: UserRole.User,
			userId: "00000000-0000-0000-0000-000000000002",
		},
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("この操作を実行する権限がありません");
	}
});
