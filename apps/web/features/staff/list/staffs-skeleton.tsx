import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@workspace/ui/components/pagination";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";

export function StaffsSkeleton() {
	return (
		<div className="space-y-4">
			<div className="sr-only">読み込み中</div>
			<Table aria-hidden>
				<TableHeader>
					<TableRow>
						<TableHead>名前</TableHead>
						<TableHead>メールアドレス</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton className="h-5 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-48" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<Skeleton className="h-10 w-20" />
					</PaginationItem>
					{Array.from({ length: 5 }).map((_, index) => (
						<PaginationItem key={index}>
							<Skeleton className="h-10 w-10" />
						</PaginationItem>
					))}
					<PaginationItem>
						<Skeleton className="h-10 w-20" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
