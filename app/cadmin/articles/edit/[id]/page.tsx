import ArticleForm from "../../components/ArticleForm";

async function getProgram(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/articles?id=${id}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function EditProgramPage({ params }: { params: { id: string } }) {
  const data = await getProgram(params.id);

  return (
    <div className="p-6">
      <ArticleForm id={Number(params.id)} defaultValues={data.data} />
    </div>
  );
}
