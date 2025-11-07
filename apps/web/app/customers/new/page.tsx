import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { CustomerForm } from "./customer-form";

export default function NewCustomerPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">顧客登録</CardTitle>
					<CardDescription>新しい顧客情報を登録します</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomerForm />
				</CardContent>
			</Card>
		</div>
	);
}
