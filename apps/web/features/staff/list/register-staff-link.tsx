import Link from "next/link";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";

export async function RegisterStaffLink() {
	const role = await getUserRole();

	if (role === UserRole.Admin) {
		return (
			<Link className="text-primary underline" href="/staffs/new">
				新規登録
			</Link>
		);
	}

	return null;
}
