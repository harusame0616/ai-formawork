import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { notFound } from "next/navigation";
import { CustomerForm } from "../../../../components/customer-form";
import { getCustomer } from "../../../../features/customer/get-customer";
import { updateCustomerAction } from "./update-customer-action";

type EditCustomerPageProps = {
	params: Promise<{
		customerId: string;
	}>;
};

export default async function EditCustomerPage({
	params,
}: EditCustomerPageProps) {
	const { customerId } = await params;
	const customer = await getCustomer(customerId);

	if (!customer) {
		notFound();
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">顧客編集</CardTitle>
					<CardDescription>顧客情報を編集します</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomerForm
						defaultValues={{
							email: customer.email,
							name: customer.name,
						}}
						onSubmit={async (values) => {
							"use server";
							return updateCustomerAction({
								...values,
								customerId: customer.customerId,
							});
						}}
						submitLabel="更新する"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
