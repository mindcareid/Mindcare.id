"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserForm from "../../components/UserForm";
import AdminAccessPanel from "../../components/AdminAccessPanel";

type AdminAccess = {
  role: "ADMIN" | "SUPERADMIN";
  isActive: boolean;
} | null;

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
  adminAccess?: AdminAccess;
};

export default function EditUserPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
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

  const targetIsAdmin = Boolean(userData.adminAccess?.isActive);
  const isSuperadmin = session?.user?.adminRole === "SUPERADMIN";
  const canEdit = !targetIsAdmin || isSuperadmin || status === "loading";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {canEdit ? (
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
      ) : (
        <div className="max-w-7xl mx-auto bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          This account holds admin access. Only a superadmin can edit its
          profile data.
        </div>
      )}
      <AdminAccessPanel
        userId={userData.id}
        initialAccess={userData.adminAccess ?? null}
      />
    </div>
  );
}
