import AboutSectionForm from "../../components/AboutSectionForm";

async function getAboutSection(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/about-section?id=${id}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function EditAboutPage({ params }: { params: { id: string } }) {
  const data = await getAboutSection(params.id);

  return (
    <div className="p-6">
      <AboutSectionForm id={Number(params.id)} defaultValues={data.data} />
    </div>
  );
}
