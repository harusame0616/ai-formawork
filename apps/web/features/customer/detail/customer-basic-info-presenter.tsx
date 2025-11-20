import type { ReactNode } from "react";
import { DateTime } from "../../../assets/components/date-time";

type Customer = {
	createdAt: Date;
	customerId: string;
	email: string | null;
	name: string;
	phone: string | null;
	updatedAt: Date;
};

type CustomerBasicInfoPresenterProps = {
	customer: Customer;
};

type CustomerField = {
	label: string;
	value: ReactNode;
};

export function CustomerBasicInfoPresenter({
	customer,
}: CustomerBasicInfoPresenterProps) {
	const fields: CustomerField[] = [
		{
			label: "メールアドレス",
			value: customer.email ? (
				<a className="text-primary underline" href={`mailto:${customer.email}`}>
					{customer.email}
				</a>
			) : (
				"未登録"
			),
		},
		{
			label: "電話番号",
			value: customer.phone ? (
				<a className="text-primary underline" href={`tel:${customer.phone}`}>
					{customer.phone}
				</a>
			) : (
				"未登録"
			),
		},
		{
			label: "登録日",
			value: <DateTime date={customer.createdAt} />,
		},
		{
			label: "更新日",
			value: <DateTime date={customer.updatedAt} />,
		},
	];

	return (
		<div className="space-y-4">
			{fields.map((field) => (
				<div className="grid gap-2" key={field.label}>
					<div className="text-sm text-muted-foreground">{field.label}</div>
					<div className="font-bold">{field.value}</div>
				</div>
			))}
		</div>
	);
}
