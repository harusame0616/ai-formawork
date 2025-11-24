import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { RegisterCustomerNoteDialogContainer } from "@/features/customer-note/register/register-customer-note-dialog-container";

export default async function CustomerNoteActionPage({
	params,
}: PageProps<"/customers/[customerId]/notes">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<Suspense
			fallback={
				<Button disabled>
					<Plus className="h-4 w-4 mr-2" />
					ノートを追加
				</Button>
			}
		>
			<RegisterCustomerNoteDialogContainer customerId={customerIdPromise} />
		</Suspense>
	);
}
