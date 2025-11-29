import { Button } from "@workspace/ui/components/button";
import { User } from "lucide-react";
import { NavigationMenu } from "./_components/navigation-menu";

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid grid-rows-[auto_1fr] h-dvh">
			<header className="border-b grid grid-cols-[auto_1fr_auto] h-16 items-center gap-4 px-4">
				<NavigationMenu />
				<span className="text-lg font-semibold">FORMAWORK.AI 顧客管理</span>
				<Button size="icon" variant="ghost">
					<User className="size-6" />
					<span className="sr-only">ユーザーメニューを開く</span>
				</Button>
			</header>
			<main className="overflow-y-auto [scrollbar-gutter:stable] bg-background">
				{children}
			</main>
		</div>
	);
}
