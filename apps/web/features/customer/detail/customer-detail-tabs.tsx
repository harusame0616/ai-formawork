"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

type CustomerDetailTabsProps = {
	customerIdPromise: Promise<string>;
};

export function CustomerDetailTabs({
	customerIdPromise,
}: CustomerDetailTabsProps) {
	const pathname = usePathname();
	const customerId = use(customerIdPromise);

	const tabs = [
		{
			href: `/customers/${customerId}/basic`,
			label: "基本情報",
		},
		{
			href: `/customers/${customerId}/reports`,
			label: "レポート",
		},
	] as const;

	return (
		<div className="border-b">
			<nav className="flex space-x-8">
				{tabs.map((tab) => {
					const isActive = pathname === tab.href;
					return (
						<Link
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								isActive
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
							}`}
							href={tab.href}
							key={tab.href}
						>
							{tab.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
