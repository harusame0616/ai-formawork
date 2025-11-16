import { SearchPagination } from "@workspace/ui/components/search-pagination";
import { CustomerNoteCard } from "./customer-note-card";
import type { CustomerNoteWithImages } from "./get-customer-notes";

type CustomerNotesPresenterProps = {
	notes: (CustomerNoteWithImages & {
		authorName: string;
		canEdit: boolean;
	})[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
};

export function CustomerNotesPresenter({
	notes,
	totalCount,
	currentPage,
	totalPages,
}: CustomerNotesPresenterProps) {
	if (!notes.length) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				ノートが見つかりませんでした
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					全{totalCount}件のノート
				</p>
			</div>

			<div className="space-y-4">
				{notes.map((note) => (
					<CustomerNoteCard
						authorName={note.authorName}
						canEdit={note.canEdit}
						key={note.id}
						note={note}
					/>
				))}
			</div>

			<SearchPagination currentPage={currentPage} totalPages={totalPages} />
		</div>
	);
}
