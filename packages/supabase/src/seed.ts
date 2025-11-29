import { createClient } from "@supabase/supabase-js";

const usersFixture = [
	{
		email: "test1@example.com",
		id: "a0000000-0000-0000-0000-000000000001",
		password: "Test@Pass123",
		role: "user",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		email: "test2@example.com",
		id: "a0000000-0000-0000-0000-000000000002",
		password: "Secure@456",
		role: "user",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		email: "admin@example.com",
		id: "a0000000-0000-0000-0000-000000000003",
		password: "Admin@789!",
		role: "admin",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
];

async function seedUsers() {
	// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
	const supabaseUrl = process.env["SUPABASE_URL"];
	// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
	const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error(
			"Missing environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
		);
	}

	const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	console.log("Starting test user seed...\n");

	for (const user of usersFixture) {
		try {
			const { data, error } = await supabase.auth.admin.createUser({
				app_metadata: { role: user.role, staffId: user.staffId },
				email: user.email,
				email_confirm: true,
				id: user.id,
				password: user.password,
			});

			if (error) {
				if (error.message.includes("already registered")) {
					console.log(`⚠️  ${user.email} - Already registered, skipping`);
				} else {
					console.error(`❌ ${user.email} - Error: ${error.message}`);
				}
			} else {
				console.log(
					`✅ ${user.email} - Created successfully (ID: ${data.user?.id})`,
				);
			}
		} catch (err) {
			console.error(
				`❌ ${user.email} - Unexpected error:`,
				err instanceof Error ? err.message : err,
			);
		}
	}

	console.log("\nTest user seed completed");
}

seedUsers().catch((error) => {
	console.error("Error during seed execution:", error);
	process.exit(1);
});
