import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { TAG_CUSTOMER } from "../../features/customer/constants";

async function getCustomers() {
	"use cache";
	cacheTag(TAG_CUSTOMER);

	return await db.select().from(customersTable);
}

export default async function CustomersPage() {
	const customers = await getCustomers();

	return (
		<div className="min-h-screen p-4">
			<div className="mx-auto max-w-4xl">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-3xl font-bold">顧客一覧</h1>
					<Button asChild>
						<Link href="/customers/create">新規登録</Link>
					</Button>
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
								<CardContent>
									<Button asChild variant="outline">
										<Link href={`/customers/${customer.customerId}/edit`}>
											編集
										</Link>
									</Button>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>
		</div>
	);
}
