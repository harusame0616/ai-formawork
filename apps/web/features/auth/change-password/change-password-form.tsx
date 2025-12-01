"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useIsHydrated } from "@/libs/use-is-hydrated";
import { changePasswordAction } from "./change-password-action";
import { type ChangePasswordParams, changePasswordSchema } from "./schema";

export function ChangePasswordForm({ disabled }: { disabled?: boolean }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { isHydrated } = useIsHydrated();

	const form = useForm<ChangePasswordParams>({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
		resolver: valibotResolver(changePasswordSchema),
	});

	function onSubmit(values: ChangePasswordParams) {
		form.clearErrors("root");
		startTransition(async () => {
			const result = await changePasswordAction(values);
			if (!result.success) {
				form.setError("root", {
					message: result.error,
				});
			}
		});
	}

	const isDisabled = isPending || !isHydrated || disabled;

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					disabled={isDisabled}
					name="currentPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>現在のパスワード</FormLabel>
							<FormDescription>
								現在使用しているパスワードを入力してください
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="current-password"
									className="max-w-xs"
									type="password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					disabled={isDisabled}
					name="newPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>新しいパスワード</FormLabel>
							<FormDescription>8文字以上で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="new-password"
									className="max-w-xs"
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
				<div className="flex gap-2">
					<Button
						disabled={isDisabled}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button disabled={isDisabled} type="submit">
						{isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								変更中...
							</>
						) : (
							"パスワードを変更"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
