"use client";

import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import type { Route } from "next";
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
			href: `/customers/${customerId}`,
			label: "基本情報",
			value: "basic",
		},
		{
			href: `/customers/${customerId}/notes`,
			label: "ノート",
			value: "notes",
		},
	] as const;

	const activeTab =
		tabs.find((tab) => pathname === tab.href)?.value ?? tabs[0].value;

	return (
		<Tabs className="w-full" value={activeTab}>
			<TabsList className="grid grid-cols-2 bg-muted-foreground/10 w-full">
				{tabs.map((tab) => (
					<TabsTrigger asChild key={tab.value} value={tab.value}>
						<Link
							aria-current={activeTab === tab.value ? "page" : undefined}
							href={tab.href as Route}
						>
							{tab.label}
						</Link>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
