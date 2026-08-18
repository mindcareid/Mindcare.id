import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  formatDate,
  formatTimeOnly,
  getTimeZoneLabel,
} from "@/lib/utils/FormatDate";
import {
  FiCalendar,
  FiMapPin,
  FiList,
  FiEdit2,
  FiDollarSign,
  FiUsers,
} from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import { Pagination } from "../components/Pagination";

export default async function ListEventCompany({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const userId = Number(session.user.id);
  const page = Number(searchParams.page ?? 1);
  const PER_PAGE = 6;

  const member = await prisma.companyUser.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { companyId: true, role: true },
  });

  if (!member) redirect("/");

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { companyId: member.companyId, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.event.count({
      where: { companyId: member.companyId, deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const canCreate = ["OWNER", "ADMIN"].includes(member.role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Event List
            </h1>
          </div>

          {canCreate && (
            <Link
              href="/company/create-event"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 
               transition-all w-full sm:w-auto"
            >
              Create Event
            </Link>
          )}
        </div>
      </div>

      {events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
          <p className="text-gray-400 text-sm">No event yet</p>

          {canCreate && (
            <Link
              href="/company/create-event"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Create your first event
            </Link>
          )}
        </div>
      )}
      {events.length > 0 && (
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              // Kartu jadi flex-col dengan flex-1 di konten supaya footer
              // aksi selalu nempel di bawah walau tinggi judul/lokasi beda-beda
              // antar card dalam satu baris grid — tidak lagi "loncat-loncat".
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              {/*
                aspect-[16/10] dipakai alih-alih h-40 tetap: rasio gambar jadi
                konsisten proporsional baik saat card lebar (1 kolom di mobile)
                maupun sempit (2-3 kolom di tablet/desktop), tidak gepeng atau
                terlalu tinggi di salah satu breakpoint.
              */}
              <div className="relative w-full aspect-16/10 overflow-hidden bg-gray-100">
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}

                <span
                  className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${
                    event.isPublished
                      ? "bg-green-100/90 text-green-700"
                      : "bg-white/90 text-gray-500 border border-gray-200"
                  }`}
                >
                  {event.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h2 className="text-[15px] font-semibold text-gray-900 line-clamp-2 min-h-10 mb-3">
                  {event.title}
                </h2>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FiCalendar className="text-gray-400 shrink-0" />
                    <span className="truncate">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FaRegClock className="text-gray-400 shrink-0" />
                    <span className="truncate">
                      {formatTimeOnly(event.startDate, event.timeZone)}-
                      {formatTimeOnly(event.endDate, event.timeZone)}{" "}
                      {getTimeZoneLabel(event.startDate, event.timeZone)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FiDollarSign className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800 truncate">
                      {event.price === 0
                        ? "Free"
                        : `Rp ${event.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FiUsers className="text-gray-400 shrink-0" />
                    <span className="truncate">
                      {event.quota == null
                        ? "Unlimited"
                        : `${event.quota} kuota`}
                    </span>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4 min-w-0">
                    <FiMapPin className="text-gray-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {/*
                  Icon-only di semua breakpoint (bukan hidden sm:inline).
                  Ini yang memperbaiki masalah tablet: teks tombol tidak lagi
                  muncul justru saat card mengecil di breakpoint sm/2-kolom.
                  Tooltip via `title` tetap ada untuk aksesibilitas nama aksi.
                */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-gray-100">
                  <Link
                    href={`/company/edit-event/${event.id}`}
                    title="Edit Event"
                    aria-label="Edit event"
                    className="flex items-center justify-center rounded-lg border border-gray-200 py-2.5 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <Link
                    href={`/company/attendee-fields/${event.id}`}
                    title="Attendee Fields"
                    aria-label="Attendee fields"
                    className="flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-white hover:bg-blue-700 transition-colors"
                  >
                    <FiList size={16} />
                  </Link>
                  <Link
                    href={`/company/participant-reports/${event.id}`}
                    title="Participant"
                    aria-label="Participant reports"
                    className="flex items-center justify-center rounded-lg border border-gray-200 py-2.5 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <FiUsers size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
