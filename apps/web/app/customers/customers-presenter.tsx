import type { SelectCustomer } from "@workspace/db/schema/customer";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@workspace/ui/components/pagination";
import Link from "next/link";

type CustomersPresenterProps = {
	customers: SelectCustomer[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	keyword?: string;
};

export function CustomersPresenter({
	customers,
	page,
	totalPages,
	keyword,
}: CustomersPresenterProps) {
	// ページネーションのリンクを生成
	function buildPageUrl(targetPage: number): string {
		const params = new URLSearchParams();
		if (keyword) {
			params.set("keyword", keyword);
		}
		params.set("page", String(targetPage));
		return `/customers?${params.toString()}`;
	}

	// ページ番号の配列を生成（最大5ページ分表示）
	function getPageNumbers(): (number | "ellipsis")[] {
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | "ellipsis")[] = [1];

		if (page > 3) {
			pages.push("ellipsis");
		}

		const start = Math.max(2, page - 1);
		const end = Math.min(totalPages - 1, page + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (page < totalPages - 2) {
			pages.push("ellipsis");
		}

		pages.push(totalPages);

		return pages;
	}

	return (
		<div className="space-y-4">
			{customers.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					顧客が見つかりませんでした
				</div>
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>名前</TableHead>
								<TableHead>メールアドレス</TableHead>
								<TableHead>電話番号</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{customers.map((customer) => (
								<TableRow key={customer.customerId}>
									<TableCell>{customer.name}</TableCell>
									<TableCell>{customer.email}</TableCell>
									<TableCell>{customer.phone || "-"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{totalPages > 1 && (
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									{page > 1 ? (
										<PaginationPrevious href={buildPageUrl(page - 1)} size="default" />
									) : (
										<span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50 gap-1 pl-2.5 h-10 px-4 py-2 text-muted-foreground">
											前へ
										</span>
									)}
								</PaginationItem>

								{getPageNumbers().map((pageNum, index) => (
									<PaginationItem key={`${pageNum}-${index}`}>
										{pageNum === "ellipsis" ? (
											<PaginationEllipsis />
										) : (
											<PaginationLink
											size="icon"
												href={buildPageUrl(pageNum)}
												isActive={pageNum === page}
											>
												{pageNum}
											</PaginationLink>
										)}
									</PaginationItem>
								))}

								<PaginationItem>
									{page < totalPages ? (
										<PaginationNext href={buildPageUrl(page + 1)} size="default" />
									) : (
										<span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50 gap-1 pr-2.5 h-10 px-4 py-2 text-muted-foreground">
											次へ
										</span>
									)}
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</>
			)}
		</div>
	);
}
