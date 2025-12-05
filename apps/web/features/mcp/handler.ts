import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifySupabaseToken } from "./auth";
import { registerCustomerTools } from "./tools/customers";

const handler = createMcpHandler(
	(server) => {
		registerCustomerTools(server);
	},
	{},
	{
		basePath: "/api/mcp",
		maxDuration: 60,
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		verboseLogs: process.env["NODE_ENV"] === "development",
	},
);

async function verifyToken(
	_req: Request,
	bearerToken?: string,
): Promise<AuthInfo | undefined> {
	if (!bearerToken) {
		return undefined;
	}

	const user = await verifySupabaseToken(bearerToken);

	if (!user) {
		return undefined;
	}

	return {
		clientId: "formawork",
		extra: {
			email: user.email,
			userId: user.userId,
		},
		scopes: [],
		token: bearerToken,
	};
}

export const authHandler = withMcpAuth(handler, verifyToken, {
	required: true,
	resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
});
