import { Button } from "@workspace/ui/components/button";
import { Menu, User } from "lucide-react";

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen flex-col">
			<header className="border-b flex h-16 items-center gap-4 px-4">
				<Button size="icon" variant="ghost">
					<Menu className="size-6" />
					<span className="sr-only">メニューを開く</span>
				</Button>
				<span className="text-lg font-semibold flex-1">
					FORMAWORK - CRM for 看護
				</span>
				<Button size="icon" variant="ghost">
					<User className="size-6" />
					<span className="sr-only">ユーザーメニューを開く</span>
				</Button>
			</header>
			<main className="flex-1 overflow-y-auto [scrollbar-gutter:stable] bg-gray-100">
				{children}
			</main>
		</div>
	);
}
