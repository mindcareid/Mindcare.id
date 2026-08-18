import AboutSection from "./section/AboutSection";
import HeroSection from "./section/HeroSection";
import ContactSection from "./section/ContactSection";
import VisionSection from "./section/VisionSection";
import { getEvents } from "@/lib/events";

/* import ProgramSectionPage from "./section/ProgramSection";
import PartnerSection from "./section/PartnerSection"; */
import CTAWithVerticalMarquee from "./components/CtaWithMarque";
import { getIndustries } from "@/lib/events";
import { HOME_EVENTS_LIMIT } from "@/lib/events/constants";
export default async function UserPage() {
  const { data: initialEvents, meta: initialMeta } = await getEvents({
    type: "upcoming",
    page: 1,
    limit: HOME_EVENTS_LIMIT,
  });

  const industries = await getIndustries();
  return (
    <>
      {" "}
      <HeroSection initialEvents={initialEvents} initialMeta={initialMeta} />
      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 my-10 sm:px-6 lg:px-8 border-2 border-gray-200 rounded-lg ">
          {/* <AboutSection /> */}
          <CTAWithVerticalMarquee industries={industries} />
          {/* <VisionSection /> */}
          {/*<ProgramSectionPage />
          <PartnerSection />*/}
        </div>
        <ContactSection />
      </section>
    </>
  );
}
