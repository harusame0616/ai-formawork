import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicConfig } from "../config";

export type UpdateSessionResult = {
	response: NextResponse;
	userId: string | null;
};

export async function updateSession(
	request: NextRequest,
): Promise<UpdateSessionResult> {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabaseConfig = getSupabasePublicConfig();

	const supabase = createServerClient(
		supabaseConfig.url,
		supabaseConfig.anonKey,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					supabaseResponse = NextResponse.next({
						request,
					});
					for (const { name, value, options } of cookiesToSet) {
						supabaseResponse.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	// IMPORTANT: DO NOT REMOVE auth.getUser()
	// Do not run code between createServerClient and supabase.auth.getUser()
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return {
		response: supabaseResponse,
		userId: user?.id ?? null,
	};
}
