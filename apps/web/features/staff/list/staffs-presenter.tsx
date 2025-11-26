import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
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
							<TableCell>{staff.name}</TableCell>
							<TableCell>{staff.email}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<SearchPagination currentPage={page} totalPages={totalPages} />
		</div>
	);
}
