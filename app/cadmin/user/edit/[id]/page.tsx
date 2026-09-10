"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import UserForm from "../../components/UserForm";

type UserData = {
  id: number;
  email: string;
  username: string;
  name: string;
  password?: string;
  phoneNumber?: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  role: "ADMIN" | "SUPERADMIN" | "USER";
  isActive: boolean;
  photo?: string;
  publicId?: string;
};

export default function EditUserPage() {
  const { id } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/user?userId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const user = data.data;

        // pastikan user object valid sebelum set
        if (user && typeof user === "object") {
          setUserData(user);
        } else {
          setUserData(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>User not found</p>;

  return (
    <div className="p-4">
      <UserForm
        id={parseInt(id as string)}
        defaultValues={{
          ...userData,
          image: userData.photo
            ? {
                secure_url: userData.photo,
                public_id: userData.publicId ?? "",
              }
            : undefined,
        }}
      />
    </div>
  );
}
