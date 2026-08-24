import Home from "./home/Home";
import { getProfessionals } from "./professionals/data/professionals";
import { getCareCentres } from "./care-centres/data/careCentres";
import { getSolutions } from "./solutions/data/solutions";
import { getUpcomingEvents } from "./events/data/events";
import { getArticles } from "./insights/data/articles";
const HOME_SECTION_LIMIT = 3;

// Home merender kartu event (yang butuh tahu acara sudah lewat atau belum) dan
// kartu care centre (yang butuh tahu jam sekarang). Dua-duanya bergantung pada
// `now`, dan halaman statis membekukan `new Date()` di waktu build — tanpa baris
// ini home akan selamanya menampilkan jam saat ia dibangun.
//
// Baris ini seharusnya sudah ada sejak halaman event dikerjakan; aturannya aku
// tulis di sana tapi tidak kumundurkan ke halaman ini. Angkanya mengikuti
// `/care-centres` (lima menit), bukan `/events` (satu jam), karena bagian yang
// paling cepat basi di halaman ini adalah status buka/tutup.
export const revalidate = 300;

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
