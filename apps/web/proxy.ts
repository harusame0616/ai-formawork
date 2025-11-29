import { updateSession } from "@repo/supabase/nextjs/proxy";
import { type NextRequest, NextResponse } from "next/server";
import { getLoggerConfig } from "./config/logger";

function setLoggerHeaders(
	response: NextResponse,
	request: NextRequest,
	userId: string | null,
): void {
	const config = getLoggerConfig();

	response.headers.set(
		"x-request-id",
		request.headers.get("x-request-id") ?? crypto.randomUUID(),
	);
	response.headers.set("x-git-commit-sha", config.gitCommitSha ?? "");
	response.headers.set("x-deployment-id", config.deploymentId ?? "");
	response.headers.set("x-auth-user-id", userId ?? "");
}

export async function proxy(request: NextRequest) {
	const { response, userId } = await updateSession(request);
	const path = request.nextUrl.pathname;
	const isLoggedIn = userId !== null;
	const isLoginPage = path === "/login";

	if (!isLoggedIn && !isLoginPage) {
		const redirectResponse = NextResponse.redirect(
			new URL("/login", request.url),
		);
		setLoggerHeaders(redirectResponse, request, userId);
		return redirectResponse;
	}

	if (isLoggedIn && isLoginPage) {
		const redirectResponse = NextResponse.redirect(
			new URL("/customers", request.url),
		);
		setLoggerHeaders(redirectResponse, request, userId);
		return redirectResponse;
	}

	setLoggerHeaders(response, request, userId);

	return response;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)",
	],
};
