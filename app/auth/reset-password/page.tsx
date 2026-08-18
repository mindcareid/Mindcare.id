import { Suspense } from "react";
import ResetPassword from "./ResetPassword";
import LoadingScreen from "../component/Loading";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResetPassword />
    </Suspense>
  );
}
