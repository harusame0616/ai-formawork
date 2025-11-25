import { CustomersPresenter } from "./customers-presenter";
import { getCustomers } from "./get-customers";
import type { CustomersCondition } from "./schema";

export async function CustomersContainer({
	condition,
}: {
	condition: Promise<CustomersCondition>;
}) {
	const { customers, page, totalPages } = await getCustomers(await condition);

	return (
		<CustomersPresenter
			customers={customers.map(({ customerId, name, phone, email }) => ({
				customerId,
				email,
				name,
				phone,
			}))}
			page={page}
			totalPages={totalPages}
		/>
	);
}
