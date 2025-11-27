import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { StaffBasicInfoContainer } from "@/features/staff/detail/staff-basic-info-container";
import { StaffBasicInfoSkeleton } from "@/features/staff/detail/staff-basic-info-skeleton";

export default function Page({ params }: PageProps<"/staffs/[staffId]">) {
	const staffIdPromise = params.then(({ staffId }) => staffId);

	return (
		<Card className="p-4 w-full">
			<Suspense fallback={<StaffBasicInfoSkeleton />}>
				<StaffBasicInfoContainer staffIdPromise={staffIdPromise} />
			</Suspense>
		</Card>
	);
}
