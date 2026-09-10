'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DataTable, { TableStyles } from 'react-data-table-component';

type CategoriesSub = {
  id: number;
  title: string;
  slug: string;
  content?: string;
  categoriesId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: {
    id: number;
    title: string;
  };
};

export default function CategoriesSubList({ categoriesId }: { categoriesId?: number }) {
  const [data, setData] = useState<CategoriesSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesName, setCategoriesName] = useState<string | null>(null);

  useEffect(() => {
    const query = categoriesId ? `?categoriesId=${categoriesId}` : '';
    fetch(`/api/categoriessub${query}`)
      .then((res) => res.json())
      .then((res) => {
        const subs = res.data || [];
        setData(subs);

        if (subs.length > 0 && subs[0].categories?.title) {
          setCategoriesName(subs[0].categories.title);
        }
      })
      .finally(() => setLoading(false));
  }, [categoriesId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sub-categories?')) return;

    const res = await fetch(`/api/categoriessub?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setData((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert('Failed to delete sub-categories.');
    }
  };

  const columns = [
    {
      name: '#',
      cell: (_row: CategoriesSub, index: number) => index + 1,
      width: '60px',
    },
    {
      name: 'Title',
      selector: (row: CategoriesSub) => row.title,
      sortable: true,
    },
    {
      name: 'Slug',
      selector: (row: CategoriesSub) => row.slug,
    },
    {
      name: 'Status',
      cell: (row: CategoriesSub) => (
        <span className={row.isActive ? 'text-green-600' : 'text-red-600'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '100px',
    },
    {
      name: 'Action',
      cell: (row: CategoriesSub) => (
        <div className="flex gap-2">
          <Link
            href={`/cadmin/categoriessub/edit/${row.id}`}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        backgroundColor: '#f3f4f6',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        wordBreak: 'break-word',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
      },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Sub-Categories Management {categoriesName ? ` for ${categoriesName}` : ''}</h2>
          <Link
            href="/cadmin/categoriessub/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Sub-Categories
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
            striped
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
}
