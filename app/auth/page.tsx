import { Suspense } from "react";
import AuthPage from "./AuthClient";
import LoadingScreen from "./component/Loading";

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthPage />
    </Suspense>
  );
}
