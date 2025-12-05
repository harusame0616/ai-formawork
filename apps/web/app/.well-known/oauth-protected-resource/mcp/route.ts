import { getSupabasePublicConfig } from "@repo/supabase/config";
import { NextResponse } from "next/server";

function getSupabaseProjectRef(): string {
	const config = getSupabasePublicConfig();
	return config.url.replace("https://", "").replace(".supabase.co", "");
}

export function GET() {
	const projectRef = getSupabaseProjectRef();

	return NextResponse.json({
		authorization_servers: [`https://${projectRef}.supabase.co/auth/v1`],
		bearer_methods_supported: ["header"],
		resource:
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			process.env["NEXT_PUBLIC_APP_URL"] ||
			"https://formawork-ai-web-git-mcp-harusame-dev-team.vercel.app",
		scopes_supported: [],
	});
}

export function OPTIONS() {
	return new NextResponse(null, {
		headers: {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Origin": "*",
		},
		status: 204,
	});
}
