import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import type { StaffsListItem } from "./schema";

type StaffsPresenterProps = {
	staffs: StaffsListItem[];
	page: number;
	totalPages: number;
};

export function StaffsPresenter({
	staffs,
	page,
	totalPages,
}: StaffsPresenterProps) {
	if (!staffs.length) {
		return (
			<div className="space-y-4">
				<div className="text-center py-8 text-muted-foreground">
					スタッフが見つかりませんでした
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>名前</TableHead>
						<TableHead>メールアドレス</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{staffs.map((staff) => (
						<TableRow key={staff.id}>
							<TableCell>
								<Link
									className="text-primary underline"
									href={`/staffs/${staff.id}`}
								>
									{staff.name}
								</Link>
							</TableCell>
							<TableCell>{staff.email || "-"}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<SearchPagination currentPage={page} totalPages={totalPages} />
		</div>
	);
}
