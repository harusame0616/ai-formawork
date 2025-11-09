import { Card } from "@workspace/ui/components/card";
import { CustomersContainer } from "./customers-container";

export default function CustomersPage({
	searchParams,
}: {
	searchParams: Promise<{ keyword?: string; page?: string }>;
}) {
	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-3xl font-bold">顧客一覧</h1>
			<Card className="p-6">
				<CustomersContainer searchParams={searchParams} />
			</Card>
		</div>
	);
}
