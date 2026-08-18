"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WhyUsForm from "@/app/cadmin/whyus/components/WhyUsForm";

interface WhyUsData {
  // define the properties of the whyus data object
  id: string;
  title: string;
  // ...
}
export default function EditWhyUsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [whyus, setWhyus] = useState<WhyUsData | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/whyus?id=${id}`)
        .then((res) => res.json())
        .then((data) => setWhyus(data.data));
    }
  }, [id]);

  if (!whyus) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10">
      <WhyUsForm id={id} defaultValues={whyus} />
    </div>
  );
}
