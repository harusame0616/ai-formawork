import { createClient } from "@repo/supabase/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ConsentPage({
	searchParams,
}: {
	searchParams: Promise<{ authorization_id?: string }>;
}) {
	const authorizationIdPromise = searchParams.then((sp) => sp.authorization_id);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ConsentContent authorizationIdPromise={authorizationIdPromise} />
		</Suspense>
	);
}

async function ConsentContent({
	authorizationIdPromise,
}: {
	authorizationIdPromise: Promise<string | undefined>;
}) {
	const authorizationId = await authorizationIdPromise;

	if (!authorizationId) {
		return <div>Error: Missing authorization_id</div>;
	}

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(
			`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`,
		);
	}

	const { data: authDetails, error } =
		await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

	console.log("OAuth authDetails:", JSON.stringify(authDetails, null, 2));

	if (error || !authDetails) {
		return (
			<div>Error: {error?.message || "Invalid authorization request"}</div>
		);
	}

	// Try approving directly to test
	const approveResult =
		await supabase.auth.oauth.approveAuthorization(authorizationId);
	console.log("OAuth direct approve test:", {
		data: approveResult.data,
		error: approveResult.error
			? {
					code: approveResult.error.code,
					message: approveResult.error.message,
					status: approveResult.error.status,
				}
			: null,
	});

	return (
		<div>
			<h1>Authorize {JSON.stringify(authDetails.user)}</h1>
			<p>This application wants to access your account.</p>
			<div>{authDetails.scope}</div>
			<div>
				<strong>Direct approve test result:</strong>
				<pre>
					{approveResult.error
						? `Error: ${approveResult.error.message}`
						: `Success: ${approveResult.data?.redirect_url}`}
				</pre>
			</div>
			<form action="/api/oauth/decision" method="POST">
				<input name="authorization_id" type="hidden" value={authorizationId} />
				<button name="decision" type="submit" value="approve">
					Approve
				</button>
				<button name="decision" type="submit" value="deny">
					Deny
				</button>
			</form>
		</div>
	);
}
