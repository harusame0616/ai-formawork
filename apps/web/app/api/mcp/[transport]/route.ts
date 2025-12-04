import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifySupabaseToken } from "@/features/mcp/auth";
import { registerCustomerTools } from "@/features/mcp/tools/customers";

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
		scopes: ["read:customers"],
		token: bearerToken,
	};
}

const authHandler = withMcpAuth(handler, verifyToken, {
	required: true,
	resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
