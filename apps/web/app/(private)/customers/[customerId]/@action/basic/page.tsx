import Link from "next/link";

export default async function CustomerBasicActionPage({
	params,
}: PageProps<"/customers/[customerId]/basic">) {
	const customerId = await params.then(({ customerId }) => customerId);

	return (
		<Link
			className="text-primary hover:underline flex items-center gap-1"
			href={
				`/customers/${
					customerId
					// biome-ignore lint/suspicious/noExplicitAny: Nextjs で型を生成してくれない。TODO: ルートの型を生成してくれない理由を調査
				}/edit` as any
			}
		>
			編集
		</Link>
	);
}
