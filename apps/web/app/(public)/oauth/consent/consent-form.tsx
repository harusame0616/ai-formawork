"use client";

import { createClient } from "@repo/supabase/nextjs/client";
import { useState } from "react";

type AuthDetails = {
	client?: { name?: string };
	redirect_uri?: string;
	redirect_url?: string;
	scopes?: string[];
	scope?: string;
	user?: unknown;
};

export function ConsentForm({ authorizationId }: { authorizationId: string }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);
	const [result, setResult] = useState<string | null>(null);

	const supabase = createClient();

	async function loadDetails() {
		setLoading(true);
		setError(null);

		const { data, error } =
			await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

		if (error) {
			setError(`getAuthorizationDetails error: ${error.message}`);
		} else {
			setAuthDetails(data);
		}

		setLoading(false);
	}

	async function handleApprove() {
		setLoading(true);
		setError(null);

		const { data, error } =
			await supabase.auth.oauth.approveAuthorization(authorizationId);

		if (error) {
			setError(`approveAuthorization error: ${error.message} (${error.code})`);
			setLoading(false);
		} else {
			setResult(`Success! Redirect URL: ${data.redirect_url}`);
			// Redirect to the client app
			window.location.href = data.redirect_url;
		}
	}

	async function handleDeny() {
		setLoading(true);
		setError(null);

		const { data, error } =
			await supabase.auth.oauth.denyAuthorization(authorizationId);

		if (error) {
			setError(`denyAuthorization error: ${error.message}`);
			setLoading(false);
		} else {
			window.location.href = data.redirect_url;
		}
	}

	return (
		<div style={{ margin: "0 auto", maxWidth: "500px", padding: "20px" }}>
			<h1>OAuth Consent</h1>
			<p>
				<strong>Authorization ID:</strong> {authorizationId}
			</p>

			{error && (
				<div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
			)}

			{result && (
				<div style={{ color: "green", marginBottom: "10px" }}>{result}</div>
			)}

			{authDetails && (
				<div style={{ marginBottom: "20px" }}>
					<h2>Authorization Details</h2>
					<pre>{JSON.stringify(authDetails, null, 2)}</pre>
				</div>
			)}

			<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
				<button disabled={loading} onClick={loadDetails} type="button">
					{loading ? "Loading..." : "Load Details"}
				</button>

				<button
					disabled={loading}
					onClick={handleApprove}
					style={{ backgroundColor: "green", color: "white" }}
					type="button"
				>
					{loading ? "Processing..." : "Approve"}
				</button>

				<button
					disabled={loading}
					onClick={handleDeny}
					style={{ backgroundColor: "red", color: "white" }}
					type="button"
				>
					{loading ? "Processing..." : "Deny"}
				</button>
			</div>
		</div>
	);
}
