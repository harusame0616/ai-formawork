import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { LoginForm } from "@/features/auth/login/login-form";

export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">ログイン</CardTitle>
					<CardDescription>FORMAWORK 顧客カルテへログイン</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</main>
	);
}
