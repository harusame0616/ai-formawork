import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import type { Customer } from "@/features/customer/get-customers";

type CustomerListPresenterProps = {
	customers: Customer[];
};

export function CustomerListPresenter({
	customers,
}: CustomerListPresenterProps) {
	if (customers.length === 0) {
		return (
			<div className="py-8 text-center text-neutral-500">
				顧客が見つかりませんでした
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
				</TableRow>
			</TableHeader>
			<TableBody>
				{customers.map((customer) => (
					<TableRow key={customer.customerId}>
						<TableCell>{customer.name}</TableCell>
						<TableCell>{customer.email}</TableCell>
						<TableCell>{customer.phoneNumber ?? "-"}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
