"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { passwordSchema, usernameSchema } from "../../features/auth/auth";

const loginFormSchema = v.object({
	password: passwordSchema,
	username: usernameSchema,
});

type LoginFormSchema = v.InferOutput<typeof loginFormSchema>;

export default function LoginPage() {
	const form = useForm<LoginFormSchema>({
		defaultValues: {
			password: "",
			username: "",
		},
		resolver: valibotResolver(loginFormSchema),
	});

	function onSubmit(values: LoginFormSchema) {
		console.log(values);
		// TODO: ログイン処理を実装
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">ログイン</CardTitle>
					<CardDescription>FORMAWORK 顧客カルテへログイン</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							className="flex flex-col gap-6"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>メールアドレス</FormLabel>
										<FormControl>
											<Input
												autoComplete="username"
												id="username"
												type="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>パスワード</FormLabel>
										<FormControl>
											<Input
												autoComplete="current-password"
												type="password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className="w-full" type="submit">
								ログイン
							</Button>
							<div className="text-center text-sm text-muted-foreground">
								アカウントがない場合、パスワードを忘れた場合は管理者にお問い合わせください。
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
