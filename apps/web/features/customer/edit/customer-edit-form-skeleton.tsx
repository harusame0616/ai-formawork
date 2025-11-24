import { EditCustomerForm } from "@/features/customer/register/edit-customer-form";

export function CustomerEditFormSkeleton() {
	return (
		<div aria-live="polite">
			<div className="sr-only">読み込み中</div>
			<EditCustomerForm aria-hidden disabled />
		</div>
	);
}
