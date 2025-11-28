import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { DeleteStaffDialog } from "@/features/staff/delete/delete-staff-dialog";

export default function Page({ params }: PageProps<"/staffs/[staffId]">) {
	const staffIdPromise = params.then(({ staffId }) => staffId);

	return (
		<Suspense fallback={<Skeleton className="h-8 w-20 bg-black/10" />}>
			<Action staffIdPromise={staffIdPromise} />
		</Suspense>
	);
}

async function Action({ staffIdPromise }: { staffIdPromise: Promise<string> }) {
	const [staffId, userRole, currentUserStaffId] = await Promise.all([
		staffIdPromise,
		getUserRole(),
		getUserStaffId(),
	]);

	if (userRole !== UserRole.Admin || staffId === currentUserStaffId) {
		return null;
	}

	return <DeleteStaffDialog staffId={staffId} />;
}
