"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { type LoginSchema, loginSchema } from "../../../features/auth/schema";
import { useIsHydrated } from "../../../libs/use-is-hydrated";
import { loginAction } from "./login-action";

export function LoginForm() {
	const [isPending, startTransition] = useTransition();
	const { isHydrated } = useIsHydrated();

	const form = useForm<LoginSchema>({
		defaultValues: {
			password: "",
			username: "",
		},
		resolver: valibotResolver(loginSchema),
	});

	function onSubmit(values: LoginSchema) {
		form.clearErrors("root");
		startTransition(async () => {
			const result = await loginAction(values);
			if (!result.success) {
				form.setError("root", {
					message: result.error,
				});
			}
			// 成功時はredirect()によって自動的にリダイレクトされる
		});
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					disabled={!isHydrated}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>メールアドレス</FormLabel>
							<FormControl>
								<Input autoComplete="username" type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					disabled={!isHydrated}
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
				{form.formState.errors.root && (
					<div className="text-sm text-destructive" role="alert">
						{form.formState.errors.root.message}
					</div>
				)}
				<Button
					className="w-full"
					disabled={isPending || !isHydrated}
					type="submit"
				>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							ログイン中...
						</>
					) : (
						"ログイン"
					)}
				</Button>
				<div className="text-center text-sm text-muted-foreground">
					アカウントがない場合、パスワードを忘れた場合は管理者にお問い合わせください。
				</div>
			</form>
		</Form>
	);
}
