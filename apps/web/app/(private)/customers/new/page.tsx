import { Card } from "@workspace/ui/components/card";
import { EditCustomerForm } from "@/features/customer/register/edit-customer-form";

export default function NewCustomerPage() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">新規顧客登録</h1>
			<Card className="p-4 w-full">
				<EditCustomerForm />
			</Card>
		</div>
	);
}
