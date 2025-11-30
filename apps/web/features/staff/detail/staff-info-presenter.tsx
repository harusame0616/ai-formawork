type StaffInfoPresenterProps = {
	firstName: string;
	lastName: string;
};

export function StaffInfoPresenter({
	firstName,
	lastName,
}: StaffInfoPresenterProps) {
	return (
		<h1 className="text-2xl font-bold h-9">
			{lastName} {firstName}
		</h1>
	);
}
