import { Card } from "@workspace/ui/components/card";
import { ChangePasswordForm } from "@/features/auth/change-password/change-password-form";

export default function PasswordChangePage() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">パスワード変更</h1>
			<Card className="p-4 w-full">
				<ChangePasswordForm />
			</Card>
		</div>
	);
}
