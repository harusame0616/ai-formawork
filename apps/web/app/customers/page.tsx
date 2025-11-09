import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";

async function getCustomers() {
	return await db
		.select({
			customerId: customersTable.customerId,
			email: customersTable.email,
			name: customersTable.name,
		})
		.from(customersTable)
		.orderBy(customersTable.createdAt);
}

export default async function CustomersPage() {
	const customers = await getCustomers();

	return (
		<div className="container mx-auto p-4">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">顧客一覧</h1>
				<Link
					className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
					href="/customers/new"
				>
					新規登録
				</Link>
			</div>
			<div className="grid gap-4">
				{customers.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<p className="text-center text-muted-foreground">
								顧客が登録されていません
							</p>
						</CardContent>
					</Card>
				) : (
					customers.map((customer) => (
						<Card key={customer.customerId}>
							<CardHeader>
								<CardTitle>{customer.name}</CardTitle>
								<CardDescription>{customer.email}</CardDescription>
							</CardHeader>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
