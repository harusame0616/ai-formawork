type StaffInfoPresenterProps = {
	name: string;
};

export function StaffInfoPresenter({ name }: StaffInfoPresenterProps) {
	return <h1 className="text-2xl font-bold h-9">{name}</h1>;
}
