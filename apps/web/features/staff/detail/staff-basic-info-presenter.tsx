import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time";

type Staff = {
	createdAt: Date;
	email: string;
	id: string;
	name: string;
	role: string;
	updatedAt: Date;
};

const RoleLabel = {
	admin: "管理者",
	user: "一般",
} as const;

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
	const roleLabel =
		staff.role in RoleLabel
			? RoleLabel[staff.role as keyof typeof RoleLabel]
			: staff.role;

	const fields: StaffField[] = [
		{
			label: "メールアドレス",
			value: staff.email || "-",
		},
		{
			label: "ロール",
			value: roleLabel,
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
