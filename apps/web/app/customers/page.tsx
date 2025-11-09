import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CustomersContainer } from "./customers-container";
import { CustomerSearchForm } from "./customer-search-form";

type CustomersPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({
	searchParams,
}: CustomersPageProps) {
	const params = await searchParams;

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>顧客一覧</CardTitle>
					<CardDescription>
						名前、メールアドレス、電話番号で検索できます
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<CustomerSearchForm />
					<Suspense
						fallback={
							<div className="text-center py-8 text-muted-foreground">
								読み込み中...
							</div>
						}
					>
						<CustomersContainer searchParams={params} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
