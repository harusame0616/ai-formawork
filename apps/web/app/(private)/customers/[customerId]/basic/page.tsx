import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CustomerBasicInfoContainer } from "@/features/customer/detail/customer-basic-info-container";
import { CustomerBasicInfoSkeleton } from "@/features/customer/detail/customer-basic-info-skeleton";

export default function Page({
	params,
}: PageProps<"/customers/[customerId]/basic">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<Card className="p-4 w-full">
			<Suspense fallback={<CustomerBasicInfoSkeleton />}>
				<CustomerBasicInfoContainer customerIdPromise={customerIdPromise} />
			</Suspense>
		</Card>
	);
}
