import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
