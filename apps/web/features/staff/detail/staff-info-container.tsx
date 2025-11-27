import { notFound } from "next/navigation";
import { getStaffDetail } from "./get-staff-detail";
import { StaffInfoPresenter } from "./staff-info-presenter";

type StaffInfoContainerProps = {
	staffIdPromise: Promise<string>;
};

export async function StaffInfoContainer({
	staffIdPromise,
}: StaffInfoContainerProps) {
	const staff = await getStaffDetail(await staffIdPromise);

	if (!staff) {
		notFound();
	}

	return <StaffInfoPresenter name={staff.name} />;
}
