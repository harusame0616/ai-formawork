import { headers } from "next/headers";
import { getBaseLogger } from "../get-logger";
import type { Logger } from "../logger";

export async function getLogger(codeLocation: string): Promise<Logger> {
	const headersList = await headers();

	const baseLogger = getBaseLogger({
		codeLocation,
		deploymentId: headersList.get("x-deployment-id"),
		gitCommitSha: headersList.get("x-git-commit-sha"),
		hostname: headersList.get("host"),
		ipAddress: headersList.get("x-forwarded-for")?.split(",")[0]?.trim(),
		requestId: headersList.get("x-request-id"),
		userAgent: headersList.get("user-agent"),
		userId: headersList.get("x-auth-user-id"),
	});

	return baseLogger;
}
