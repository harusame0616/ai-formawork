import type { CustomerSearchConditionInput } from "../schema";
import { CustomersPresenter } from "./customers-presenter";
import { getCustomers } from "./get-customers";

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
