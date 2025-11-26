import { Card } from "@workspace/ui/components/card";
import { EditStaffForm } from "@/features/staff/register/edit-staff-form";

export default function NewStaffPage() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">新規スタッフ登録</h1>
			<Card className="p-4 w-full">
				<EditStaffForm />
			</Card>
		</div>
	);
}
