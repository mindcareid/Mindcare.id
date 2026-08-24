import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { CareCentre } from "../../care-centres/type/careCentre";
import InsightsGrid from "../../insights/section/InsightsGrid";
import type { Article } from "../../insights/type/article";
import EventsCardGrid from "../../events/section/EventsCardGrid";
import type { MindcareEvent } from "../../events/type/event";
import ProfessionalAbout from "../section/ProfessionalAbout";
import ProfessionalCentre from "../section/ProfessionalCentre";
import ProfessionalEducation from "../section/ProfessionalEducation";
import ProfessionalHero from "../section/ProfessionalHero";
import ProfessionalServices from "../section/ProfessionalServices";
import ProfessionalsGrid from "../section/ProfessionalsGrid";
import type { Professional } from "../type/professional";

type ProfessionalProfileProps = {
  professional: Professional;
  /**
   * Tempat praktiknya, atau `null` kalau belum terikat centre mana pun. Dua dari
   * lima belas profesional di mock data memang belum, dan itu keadaan yang sah.
   */
  centre: CareCentre | null;
  articles: Article[];
  events: MindcareEvent[];
  related: Professional[];
  now: string;
};

export default function ProfessionalProfile({
  professional,
  centre,
  articles,
  events,
  related,
  now,
}: ProfessionalProfileProps) {
  return (
    <div className="min-h-screen">
      <ProfessionalHero professional={professional} />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <ProfessionalAbout professional={professional} />
          <ProfessionalServices professional={professional} />

          {/* Letaknya setelah tarif dan sebelum riwayat pendidikan, mengikuti
              urutan pertanyaan pembaca: berapa biayanya, di mana tempatnya,
              baru latar belakangnya.

              Disembunyikan seluruhnya kalau `centre` null — bukan diganti
              kalimat "Practises independently". Alasannya di
              `ProfessionalCentre.tsx`: itu akan mengubah ketiadaan data menjadi
              sebuah pernyataan. */}
          {centre && <ProfessionalCentre centre={centre} />}

          <ProfessionalEducation professional={professional} />

          {articles.length > 0 && (
            <div>
              <SectionHeader
                title={`Articles by ${professional.fullName}`}
                href="/insights"
                underline
              />
              <InsightsGrid articles={articles} className="mt-6" />
            </div>
          )}

          {events.length > 0 && (
            <div>
              <SectionHeader
                title="Upcoming events"
                href="/events"
                underline
              />
              <EventsCardGrid events={events} now={now} className="mt-6" />
            </div>
          )}

          {related.length > 0 && (
            <div>
              <SectionHeader
                title="More professionals"
                href="/professionals"
                underline
              />
              <div className="mt-6">
                <ProfessionalsGrid professionals={related} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
