import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import ProfessionalsGrid from "../../professionals/section/ProfessionalsGrid";
import type { Professional } from "../../professionals/type/professional";
import CentreHero from "../section/CentreHero";
import CentreHours from "../section/CentreHours";
import CentreLocation from "../section/CentreLocation";
import CentreServices from "../section/CentreServices";
import type { CareCentre } from "../type/careCentre";


type CareCentreDetailProps = {
  centre: CareCentre;
  professionals: Professional[];
  now: string;
};

export default function CareCentreDetail({
  centre,
  professionals,
  now,
}: CareCentreDetailProps) {
  return (
    <div className="min-h-screen">
      <CentreHero centre={centre} now={now} />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <CentreServices centre={centre} />

          <CentreHours centre={centre} now={now} />

          <CentreLocation centre={centre} />

          {professionals.length > 0 && (
            <div>
              <SectionHeader
                title="Professionals listed here"
                description="Only professionals with a Mindcare profile appear below. Other staff at this centre may not be listed."
                href="/professionals"
                underline
              />
              <div className="mt-6">
                <ProfessionalsGrid professionals={professionals} now={now} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
