import type { Metadata } from "next";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
	description: "AI とともに仕事を形作る社内システムプラットフォーム",
	title: "FORMAWORK.AI",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className="antialiased font-sans bg-white">{children}</body>
		</html>
	);
}
