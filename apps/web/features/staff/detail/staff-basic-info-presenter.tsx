import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time";

type Staff = {
	createdAt: Date;
	email: string;
	id: string;
	name: string;
	updatedAt: Date;
};

type StaffBasicInfoPresenterProps = {
	staff: Staff;
};

type StaffField = {
	label: string;
	value: ReactNode;
};

export function StaffBasicInfoPresenter({
	staff,
}: StaffBasicInfoPresenterProps) {
	const fields: StaffField[] = [
		{
			label: "メールアドレス",
			value: (
				<a className="text-primary underline" href={`mailto:${staff.email}`}>
					{staff.email}
				</a>
			),
		},
		{
			label: "登録日",
			value: <DateTime date={staff.createdAt} />,
		},
		{
			label: "更新日",
			value: <DateTime date={staff.updatedAt} />,
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
