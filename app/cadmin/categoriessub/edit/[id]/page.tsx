import CategoriesSubForm from '../../components/CategoriesSubForm';

interface CategoriesSubData {
  // define the properties of the data object here
  id: number;
  title: string;
  // ...
}

interface CategoriesSubResponse {
  data: CategoriesSubData | null;
  error?: string;
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const id = params.id;

  if (!id) {
    return <div className="p-6 text-red-500">Invalid CategoriesSub ID.</div>;
  }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/categoriessub?id=${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data. Status: ${res.status}`);
    }

    const json: CategoriesSubResponse = await res.json();

    if (!json.data) {
      return <div className="p-6 text-red-500">Sub Categories not found.</div>;
    }

    return (
      <div className="p-6">
        <CategoriesSubForm defaultValues={json.data} />
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading data: {(error as Error).message}
      </div>
    );
  }
}
