"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { createCustomerAction } from "../../../features/customer/create-customer-action";
import { CustomerForm } from "../../../features/customer/customer-form";
import type { CustomerFormSchema } from "../../../features/customer/schema";

export default function CustomerNewPage() {
	async function handleSubmit(values: CustomerFormSchema) {
		const result = await createCustomerAction(values);
		if (!result.success) {
			return { error: result.error };
		}
		// 成功時はcreateCustomerAction内でredirect()される
		return {};
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">顧客登録</CardTitle>
					<CardDescription>新規顧客を登録します</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomerForm
						onSubmit={handleSubmit}
						submitButtonText="登録"
						submittingButtonText="登録中..."
					/>
				</CardContent>
			</Card>
		</div>
	);
}
