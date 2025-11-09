import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { CustomerForm } from "../../../components/customer-form";
import { createCustomerAction } from "./create-customer-action";

export default function CreateCustomerPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">顧客登録</CardTitle>
					<CardDescription>新しい顧客を登録します</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomerForm
						onSubmit={createCustomerAction}
						submitLabel="登録する"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
