import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getCustomersForMcp } from "../get-customers";

export function registerCustomerTools(server: McpServer) {
	server.tool(
		"search_customers",
		"顧客を検索します。キーワードで名前（姓・名）を検索できます。",
		{
			keyword: z
				.string()
				.max(300)
				.optional()
				.describe("検索キーワード（名前の完全一致）"),
			page: z
				.number()
				.int()
				.min(1)
				.default(1)
				.describe("ページ番号（1ページ20件）"),
		},
		async ({ keyword, page }) => {
			const result = await getCustomersForMcp({
				keyword: keyword || undefined,
				page: page || 1,
			});

			return {
				content: [
					{
						text: JSON.stringify(
							{
								customers: result.customers.map((c) => ({
									email: c.email,
									id: c.customerId,
									name: `${c.lastName} ${c.firstName}`,
									phone: c.phone,
								})),
								pagination: {
									currentPage: result.page,
									totalPages: result.totalPages,
								},
							},
							null,
							2,
						),
						type: "text",
					},
				],
			};
		},
	);
}
