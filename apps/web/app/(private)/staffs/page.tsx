import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { RegisterStaffLink } from "@/features/staff/list/register-staff-link";
import { parseStaffsConditionSearchParams } from "@/features/staff/list/schema";
import { StaffSearchFormContainer } from "@/features/staff/list/staff-search-form-container";
import { StaffSearchForm } from "@/features/staff/list/staff-search-form-presenter";
import { StaffsContainer } from "@/features/staff/list/staffs-container";
import { StaffsSkeleton } from "@/features/staff/list/staffs-skeleton";
import { SuspenseOnSearch } from "@/libs/suspense-on-search";

export default async function Page({ searchParams }: PageProps<"/staffs">) {
	const validatedCondition = searchParams.then(
		(params) => parseStaffsConditionSearchParams(params).data,
	);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold">スタッフ一覧</h1>
				<Suspense fallback={<Skeleton className="h-5 w-16" />}>
					<RegisterStaffLink />
				</Suspense>
			</div>
			<Card className="p-4 w-full">
				<SuspenseOnSearch
					fallback={<StaffSearchForm condition={{ keyword: "" }} />}
				>
					<StaffSearchFormContainer conditionPromise={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
			<Card className="py-2 w-full">
				<SuspenseOnSearch fallback={<StaffsSkeleton />}>
					<StaffsContainer condition={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
		</div>
	);
}
