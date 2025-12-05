// app/oauth/consent/page.tsx
import { createClient } from "@repo/supabase/nextjs/server";
import { redirect } from "next/navigation";

export default async function ConsentPage({
	searchParams,
}: {
	searchParams: { authorization_id?: string };
}) {
	const authorizationId = searchParams.authorization_id;
	if (!authorizationId) {
		return <div>Error: Missing authorization_id</div>;
	}

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		// Redirect to login, preserving authorization_id
		redirect(
			`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`,
		);
	}
	// Get authorization details using the authorization_id
	const { data: authDetails, error } =
		await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

	if (error || !authDetails) {
		return (
			<div>Error: {error?.message || "Invalid authorization request"}</div>
		);
	}
	console.log({ authDetails });
	return (
		<div>
			<h1>Authorize {JSON.stringify(authDetails.user)}</h1>
			<p>This application wants to access your account.</p>
			<div>{authDetails.scope}</div>
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
