import { notFound } from "next/navigation";
import { EditCustomerForm } from "../../register/edit-customer-form";
import { getCustomerDetail } from "../get-customer-detail";

type CustomerEditFormContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerEditFormContainer({
	customerIdPromise,
}: CustomerEditFormContainerProps) {
	const customer = await getCustomerDetail(await customerIdPromise);

	if (!customer) {
		notFound();
	}

	return (
		<EditCustomerForm
			customerId={customer.customerId}
			initialValues={{
				email: customer.email,
				name: customer.name,
				phone: customer.phone,
			}}
		/>
	);
}
