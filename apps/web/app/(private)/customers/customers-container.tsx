import { getCustomers } from "../../../features/customer/get-customers";
import type { CustomerSearchConditionInput } from "../../../features/customer/schema";
import { CustomersPresenter } from "./customers-presenter";

type CustomersContainerProps = {
	condition: Promise<CustomerSearchConditionInput>;
};

export async function CustomersContainer({
	condition,
}: CustomersContainerProps) {
	const params = await condition;
	const result = await getCustomers(params);

	return <CustomersPresenter {...result} />;
}
