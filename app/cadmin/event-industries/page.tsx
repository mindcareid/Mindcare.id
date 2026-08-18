
import prisma from "@/lib/prisma";
import IndustriesList from "./_components/IndustriesList";
import CreateIndustryForm from "./_components/CreateIndustryForm";
import { Pagination } from "@/app/(company)/company/components/Pagination";

const PER_PAGE = 10;

// searchParams otomatis di-inject Next.js ke Server Component
async function getIndustries(page: number) {
  const skip = (page - 1) * PER_PAGE;

  // Jalankan dua query bersamaan supaya tidak nunggu satu-satu
  const [industries, total] = await Promise.all([
    prisma.industry.findMany({
      orderBy: { name: "asc" },
      skip,
      take: PER_PAGE,
    }),
    prisma.industry.count(),
  ]);

  return {
    industries,
    totalPages: Math.ceil(total / PER_PAGE),
  };
}

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function IndustriesPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const { industries, totalPages } = await getIndustries(currentPage);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Manage Industries
      </h1>
      <CreateIndustryForm />
      <IndustriesList initialData={industries} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="?"  
      />
    </div>
  );
}