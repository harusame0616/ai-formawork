import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";

export default function Page({ params }: PageProps<"/customers/[customerId]">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<Suspense fallback={<Skeleton className="h-4 w-10 bg-black/10" />}>
			<Action customerIdPromise={customerIdPromise} />
		</Suspense>
	);
}

async function Action({
	customerIdPromise,
}: {
	customerIdPromise: Promise<string>;
}) {
	return (
		<Link
			className="text-primary underline flex items-center gap-1"
			href={`/customers/${await customerIdPromise}/edit`}
		>
			編集
		</Link>
	);
}
