'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Categories = {
  id: number;
  title: string;
};

type CategoriesSub = {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  categoriesId: number;
  isActive: boolean;
};

export default function CategoriesSubForm({ defaultValues }: { defaultValues?: Partial<CategoriesSub> }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoriesSub>({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      categoriesId: 0,
      isActive: true,
      ...defaultValues,
    },
  });


  const [categoriess, setCategoriess] = useState<Categories[]>([]);
  const categoriesName =
    defaultValues?.categoriesId
      ? categoriess.find(p => p.id === defaultValues.categoriesId)?.title ?? ''
      : '';

  useEffect(() => {
    let mounted = true;

    (async () => {
      const res = await fetch('/api/categories');
      const json = await res.json();

      if (mounted) {
        setCategoriess(json.data || []);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof CategoriesSub, value);
      });
    }
  }, [defaultValues, setValue]);

  const onSubmit = async (data: CategoriesSub) => {
    const res = await fetch(
      defaultValues?.id ? `/api/categoriessub?id=${defaultValues.id}` : '/api/categoriessub',
      {
        method: defaultValues?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      router.push('/cadmin/categoriessub');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-6">
        {defaultValues?.id ? "Edit Sub Categories" : "Create Sub Categories"}
      </h2>
      <div>
        <label className="block font-medium mb-1">Categories</label>
        {defaultValues?.categoriesId ? (
          <>
            <input
              type="text"
              value={categoriesName}
              readOnly
              className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-700"
            />
            <input
              type="hidden"
              {...register('categoriesId', { valueAsNumber: true })}
              value={defaultValues.categoriesId}
            />
          </>
        ) : (
          <select
            {...register('categoriesId', { required: 'Categories is required', valueAsNumber: true })}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select a categories</option>
            {categoriess.map((categories) => (
              <option key={categories.id} value={categories.id}>
                {categories.title}
              </option>
            ))}
          </select>
        )}
        {errors.categoriesId && <p className="text-red-500 text-sm mt-1">{errors.categoriesId.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Sub Title</label>
        <input
          {...register('title', {
            required: 'Title is required',
            onChange: (e) => {
              // hanya auto slug saat CREATE
              if (!defaultValues?.id) {
                const value = e.target.value;
                const slug = value
                  .toLowerCase()
                  .trim()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');

                setValue('slug', slug, { shouldDirty: true });
              }
            },
          })}
          placeholder="Enter title"
          className="w-full border px-4 py-2 rounded"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Slug</label>
        <input
          {...register('slug', { required: 'Slug is required' })}
          placeholder="Enter slug"
          className="w-full border px-4 py-2 rounded"
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Content</label>
        <textarea
          {...register('content')}
          placeholder="Enter content"
          className="w-full border px-4 py-2 rounded h-28"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          {...register('isActive')}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium">Active</label>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {defaultValues?.id ? 'Update Sub Categories' : 'Create Sub Categories'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
