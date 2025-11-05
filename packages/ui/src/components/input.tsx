"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import type * as React from "react";
import { forwardRef, useState } from "react";

const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);
		const isPasswordInput = type === "password";

		const inputType = isPasswordInput && showPassword ? "text" : type;

		if (isPasswordInput) {
			return (
				<div className="relative">
					<input
						className={cn(
							"flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base shadow-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm",
							className,
						)}
						ref={ref}
						type={inputType}
						{...props}
					/>
					<button
						aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						onClick={() => setShowPassword(!showPassword)}
						type="button"
					>
						{showPassword ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				</div>
			);
		}

		return (
			<input
				className={cn(
					"flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm",
					className,
				)}
				ref={ref}
				type={type}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";

export { Input };
