"use client";

import { useMemo, useState } from "react";
import type { OrderWithEvent, SortOptions, StatusFilter } from "@/lib/orders";
import { sortOrders } from "@/lib/orders";
import { OrderFilterBar } from "./OrderFilterBar";
import { OrderTable } from "./OrderTable";
import { OrderEmptyState } from "./OrderEmptyState";
import { Pagination } from "./Pagination";
import { OrderCard } from "./OrderCard";

const ITEMS_PER_PAGE = 6;

export default function OrderList({ orders }: { orders: OrderWithEvent[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [activeSort, setActiveSort] = useState<SortOptions>("date-desc");

  // Step 1: filter by status
  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  // Step 2: sort hasil filter
  const sorted = useMemo(
    () => sortOrders(filtered, activeSort),
    [filtered, activeSort],
  );

  // Step 3: ambil slice untuk halaman aktif
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  // Reset ke page 1 setiap kali filter atau sort berubah
  function handleFilterChange(filter: StatusFilter) {
    setActiveFilter(filter);
    setCurrentPage(1);
  }

  function handleSortChange(sort: SortOptions) {
    setActiveSort(sort);
    setCurrentPage(1);
  }

  // Kalau sama sekali tidak ada orders, tidak perlu render filter
  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <OrderEmptyState isFiltered={false} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          My Orders
        </h1>
        <p className="mt-1 text-md text-muted-foreground">
          Track and manage your event registrations.
        </p>
      </div>

      {/* Filter + Sort bar */}
      <div className="mb-4">
        <OrderFilterBar
          activeFilter={activeFilter}
          activeSort={activeSort}
          totalCount={sorted.length}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Content */}
      {paginated.length === 0 ? (
        <OrderEmptyState
          isFiltered={activeFilter !== "ALL"}
          onClearFilter={() => handleFilterChange("ALL")}
        />
      ) : (
        <>
          {/* Desktop: table — hidden di mobile */}
          <div className="hidden md:block">
            <OrderTable orders={paginated} />
          </div>

          {/* Mobile: cards — hidden di desktop */}
          <div className="flex flex-col gap-3 md:hidden">
            {paginated.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
