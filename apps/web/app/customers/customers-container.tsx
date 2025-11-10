import { getCustomers } from "../../features/customer/get-customers";
import type { CustomerSearchCondition } from "../../features/customer/schema";
import { CustomersPresenter } from "./customers-presenter";

type CustomersContainerProps = {
	condition: Promise<CustomerSearchCondition>;
};

export async function CustomersContainer({
	condition,
}: CustomersContainerProps) {
	const params = await condition;
	const result = await getCustomers(params);

	return <CustomersPresenter {...result} />;
}
