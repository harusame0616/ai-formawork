import { createClient } from "@repo/supabase/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ConsentForm } from "./consent-form";

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

	return <ConsentForm authorizationId={authorizationId} />;
}
