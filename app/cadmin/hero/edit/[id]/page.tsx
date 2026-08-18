"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HeroForm from "../../components/HeroForm";

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  // other properties...
}


export default function EditHeroPage() {
  const params = useParams();
  const id = params?.id as string;
  const [hero, setHero] = useState<HeroData | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/hero?id=${id}`)
        .then((res) => res.json())
        .then((data) => setHero(data.data)); // pastikan API response konsisten
    }
  }, [id]);

  if (!hero) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Edit Hero Slider</h1>
      <HeroForm id={parseInt(id)} defaultValues={hero} />
    </div>
  );
}
