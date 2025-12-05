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
import { useForm } from "react-hook-form";
import { LoadingIcon } from "@/components/loading-icon";
import { type LoginParams, loginSchema } from "@/features/auth/login/schema";
import { useIsHydrated } from "@/libs/use-is-hydrated";
import { defaultPassword, defaultUserName } from "./default-user";
import { loginAction } from "./login-action";

export function LoginForm() {
	const { isHydrated } = useIsHydrated();

	const form = useForm<LoginParams>({
		defaultValues: {
			// デモ用に環境変数で初期値を設定できるようにする
			password: defaultPassword,
			username: defaultUserName,
		},
		resolver: valibotResolver(loginSchema),
	});

	async function onSubmit(values: LoginParams) {
		form.clearErrors("root");
		const result = await loginAction(values);
		if (!result.success) {
			form.setError("root", {
				message: result.error,
			});
		}
		// 成功時はredirect()によって自動的にリダイレクトされる
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
					disabled={form.formState.isSubmitting || !isHydrated}
					type="submit"
				>
					{form.formState.isSubmitting ? (
						<>
							ログイン中
							<LoadingIcon />
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
