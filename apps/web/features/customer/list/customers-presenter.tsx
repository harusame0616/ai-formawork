import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import type { CustomersListItem } from "./schema";

type CustomersPresenterProps = {
	customers: CustomersListItem[];
	page: number;
	totalPages: number;
};

export function CustomersPresenter({
	customers,
	page,
	totalPages,
}: CustomersPresenterProps) {
	if (!customers.length) {
		return (
			<div className="space-y-4">
				<div className="text-center py-8 text-muted-foreground">
					顧客が見つかりませんでした
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
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
							<TableCell>
								<Link
									className="text-primary underline"
									href={`/customers/${customer.customerId}`}
								>
									{customer.name}
								</Link>
							</TableCell>
							<TableCell>{customer.email}</TableCell>
							<TableCell>{customer.phone || "-"}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<SearchPagination currentPage={page} totalPages={totalPages} />
		</div>
	);
}
