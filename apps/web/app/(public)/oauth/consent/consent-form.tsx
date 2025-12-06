"use client";

import { createClient } from "@repo/supabase/nextjs/client";
import { useEffect, useState } from "react";

type AuthDetails = {
	redirect_url?: string;
	client?: {
		name?: string;
	};
	scopes?: string[];
};

export function ConsentForm({ authorizationId }: { authorizationId: string }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);

	const supabase = createClient();

	useEffect(() => {
		async function loadDetails() {
			const { data, error } =
				await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

			if (error) {
				setError(`認証情報の取得に失敗しました: ${error.message}`);
			} else {
				setAuthDetails(data as unknown as AuthDetails);
			}

			setLoading(false);
		}

		loadDetails();
	}, [authorizationId, supabase.auth.oauth]);

	function handleApprove() {
		if (!authDetails?.redirect_url) {
			setError("リダイレクト URL が見つかりません");
			return;
		}
		// getAuthorizationDetails の redirect_url には既に認証コードが含まれている
		window.location.href = authDetails.redirect_url;
	}

	async function handleDeny() {
		setLoading(true);
		setError(null);

		const { data, error } =
			await supabase.auth.oauth.denyAuthorization(authorizationId);

		if (error) {
			setError(`拒否処理に失敗しました: ${error.message}`);
			setLoading(false);
		} else {
			window.location.href = data.redirect_url;
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="text-lg">読み込み中...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
					<h1 className="mb-4 text-xl font-bold text-red-800">エラー</h1>
					<p className="text-red-700">{error}</p>
				</div>
			</div>
		);
	}

	const clientName = authDetails?.client?.name || "外部アプリケーション";

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
				<h1 className="mb-6 text-center text-2xl font-bold">
					アクセス許可のリクエスト
				</h1>

				<div className="mb-6 text-center">
					<p className="text-gray-600">
						<span className="font-semibold text-gray-900">{clientName}</span>
						<br />
						があなたのアカウントへのアクセスを求めています。
					</p>
				</div>

				{authDetails?.scopes && authDetails.scopes.length > 0 && (
					<div className="mb-6">
						<h2 className="mb-2 font-semibold text-gray-700">
							リクエストされている権限:
						</h2>
						<ul className="list-inside list-disc text-gray-600">
							{authDetails.scopes.map((scope) => (
								<li key={scope}>{scope}</li>
							))}
						</ul>
					</div>
				)}

				<div className="flex gap-3">
					<button
						className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
						onClick={handleDeny}
						type="button"
					>
						拒否
					</button>
					<button
						className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
						onClick={handleApprove}
						type="button"
					>
						許可
					</button>
				</div>
			</div>
		</div>
	);
}
