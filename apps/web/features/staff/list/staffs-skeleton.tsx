import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@workspace/ui/components/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";

function SkeletonBox({ className = "" }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={`animate-pulse bg-muted rounded ${className}`}
		/>
	);
}

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
								<SkeletonBox className="h-5 w-32" />
							</TableCell>
							<TableCell>
								<SkeletonBox className="h-5 w-48" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<SkeletonBox className="h-10 w-20" />
					</PaginationItem>
					{Array.from({ length: 5 }).map((_, index) => (
						<PaginationItem key={index}>
							<SkeletonBox className="h-10 w-10" />
						</PaginationItem>
					))}
					<PaginationItem>
						<SkeletonBox className="h-10 w-20" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
