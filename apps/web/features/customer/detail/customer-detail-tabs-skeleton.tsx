import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export function CustomerDetailTabsSkeleton() {
	const tabs = [
		{ label: "基本情報", value: "basic" },
		{ label: "ノート", value: "notes" },
	] as const;

	return (
		<Tabs className="w-full" value="basic">
			<TabsList className="grid grid-cols-2 bg-muted-foreground/10 w-full">
				{tabs.map((tab) => (
					<TabsTrigger
						className="pointer-events-none opacity-50"
						disabled
						key={tab.value}
						value={tab.value}
					>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
