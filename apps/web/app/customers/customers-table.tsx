import type { SelectCustomer } from "@workspace/db/schema/customer";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";

type CustomersTableProps = {
	customers: SelectCustomer[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
	if (customers.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground">
				該当する顧客が見つかりませんでした
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>名前</TableHead>
					<TableHead>メールアドレス</TableHead>
					<TableHead>電話番号</TableHead>
					<TableHead>登録日</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{customers.map((customer) => (
					<TableRow key={customer.customerId}>
						<TableCell>{customer.name}</TableCell>
						<TableCell>{customer.email}</TableCell>
						<TableCell>{customer.phoneNumber || "-"}</TableCell>
						<TableCell>
							{new Date(customer.createdAt).toLocaleDateString("ja-JP")}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
