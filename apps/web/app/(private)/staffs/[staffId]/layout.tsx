import type { ReactNode } from "react";
import { Suspense } from "react";
import { StaffInfoContainer } from "@/features/staff/detail/staff-info-container";
import { StaffInfoSkeleton } from "@/features/staff/detail/staff-info-skeleton";

type StaffDetailLayoutProps = LayoutProps<"/staffs/[staffId]"> & {
	action: ReactNode;
};

export default async function StaffDetailLayout({
	params,
	children,
	action,
}: StaffDetailLayoutProps) {
	const staffIdPromise = params.then(({ staffId }) => staffId);

	return (
		<div className="container mx-auto p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Suspense fallback={<StaffInfoSkeleton />}>
					<StaffInfoContainer staffIdPromise={staffIdPromise} />
				</Suspense>
				{action}
			</div>

			{children}
		</div>
	);
}
