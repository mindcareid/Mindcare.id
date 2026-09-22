import { redirect } from "next/navigation";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();

  const callbackUrl = searchParams.callbackUrl;
  if (typeof callbackUrl === "string" && callbackUrl !== "") {
    const safeUrl =
      callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : null;
    if (safeUrl) params.set("callbackUrl", safeUrl);
  }

  if (searchParams.registered === "true") {
    params.set("registered", "true");
  }

  const query = params.toString();
  redirect(`/auth?tab=login${query ? `&${query}` : ""}`);
}
