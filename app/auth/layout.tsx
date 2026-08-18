import NavbarAuth from "./component/NavbarAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarAuth />
      <main className="flex-1">{children}</main>
    </div>
  );
}
