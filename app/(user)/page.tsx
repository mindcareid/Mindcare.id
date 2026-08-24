import Home from "./home/Home";
import { getProfessionals } from "./professionals/data/professionals";
import { getCareCentres } from "./care-centres/data/careCentres";
import { getSolutions } from "./solutions/data/solutions";
import { getUpcomingEvents } from "./events/data/events";
import { getArticles } from "./insights/data/articles";
const HOME_SECTION_LIMIT = 3;

export default async function UserPage() {
  const now = new Date().toISOString();

  const [professionals, centres, solutions, events, articles] =
    await Promise.all([
      getProfessionals(),
      getCareCentres(),
      getSolutions(),
      getUpcomingEvents(HOME_SECTION_LIMIT, now),
      getArticles(),
    ]);

  return (
    <Home
      professionals={professionals.slice(0, HOME_SECTION_LIMIT)}
      centres={centres.slice(0, HOME_SECTION_LIMIT)}
      solutions={solutions.slice(0, HOME_SECTION_LIMIT)}
      events={events}
      articles={articles.slice(0, HOME_SECTION_LIMIT)}
      now={now}
    />
  );
}
