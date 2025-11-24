import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CustomerEditFormContainer } from "@/features/customer/edit/customer-edit-form-container";
import { CustomerEditFormSkeleton } from "@/features/customer/edit/customer-edit-form-skeleton";

export default function Page({
	params,
}: PageProps<"/customers/[customerId]/edit">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">顧客情報の編集</h1>
			<Card className="p-4 w-full">
				<Suspense fallback={<CustomerEditFormSkeleton />}>
					<CustomerEditFormContainer customerIdPromise={customerIdPromise} />
				</Suspense>
			</Card>
		</div>
	);
}
