type CustomerInfoPresenterProps = {
	name: string;
};

export function CustomerInfoPresenter({ name }: CustomerInfoPresenterProps) {
	return <h1 className="text-2xl font-bold h-9">{name}</h1>;
}
