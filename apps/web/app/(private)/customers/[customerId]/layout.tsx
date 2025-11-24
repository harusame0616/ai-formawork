import type { ReactNode } from "react";
import { Suspense } from "react";
import { CustomerDetailTabs } from "@/features/customer/detail/customer-detail-tabs";
import { CustomerDetailTabsSkeleton } from "@/features/customer/detail/customer-detail-tabs-skeleton";
import { CustomerInfoContainer } from "@/features/customer/detail/customer-info-container";
import { CustomerInfoSkeleton } from "@/features/customer/detail/customer-info-skeleton";

type CustomerDetailLayoutProps = LayoutProps<"/customers/[customerId]"> & {
	action: ReactNode;
};

export default async function CustomerDetailLayout({
	params,
	children,
	action,
}: CustomerDetailLayoutProps) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<div className="container mx-auto p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Suspense fallback={<CustomerInfoSkeleton />}>
					<CustomerInfoContainer customerIdPromise={customerIdPromise} />
				</Suspense>
				{action}
			</div>

			<Suspense fallback={<CustomerDetailTabsSkeleton />}>
				<CustomerDetailTabs customerIdPromise={customerIdPromise} />
			</Suspense>

			{children}
		</div>
	);
}
