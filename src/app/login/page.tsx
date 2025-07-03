import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OAuthErrorHandler, MicrosoftOAuthButton } from "@/src/components/login";
import { Input } from "@/src/components/ui/input";
import { SubmitButton } from "@/src/components/ui/submit-button";
import { createClient } from "@/src/lib/supabase/server";

export default async function Login({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ message?: string; returnUrl?: string }>;
}>) {
  const params = await searchParams;

  // Check if we're running locally
  const isLocal = process.env.NEXT_PUBLIC_URL?.includes("localhost") ?? true;

  const signIn = async (_prevState: unknown, formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error != null) {
      return redirect(
        `/login?message=Could not authenticate user&returnUrl=${params.returnUrl ?? ""}`
      );
    }

    return redirect(params.returnUrl ?? "/dashboard");
  };

  const signUp = async (_prevState: unknown, formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?returnUrl=${params.returnUrl}`,
      },
    });

    if (error != null) {
      return redirect(
        `/login?message=Could not authenticate user&returnUrl=${params.returnUrl ?? ""}`
      );
    }

    return redirect(
      `/login?message=Check email to continue sign in process&returnUrl=${params.returnUrl ?? ""}`
    );
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <Link
        href="/"
        className="bg-btn-background hover:bg-btn-background-hover group absolute left-8 top-8 flex items-center rounded-md px-4 py-2 text-sm text-foreground no-underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <form className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground animate-in">
        <OAuthErrorHandler />

        {/* Welcome Message */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Welcome CTI Team</h1>
        </div>

        <div className="flex w-full flex-col gap-2">
          <MicrosoftOAuthButton returnUrl={params.returnUrl ?? undefined} />
        </div>

        {/* Only show email login in local development */}
        {isLocal && (
          <>
            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">or continue with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <label className="text-md" htmlFor="email">
              Email
            </label>
            <Input name="email" placeholder="you@example.com" autoComplete="email" required />
            <label className="text-md" htmlFor="password">
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <SubmitButton formAction={signIn} pendingText="Signing In...">
              Sign In
            </SubmitButton>
            <SubmitButton formAction={signUp} variant="outline" pendingText="Signing Up...">
              Sign Up
            </SubmitButton>
          </>
        )}

        {params.message !== undefined && (
          <p className="mt-4 bg-foreground/10 p-4 text-center text-foreground">{params.message}</p>
        )}
      </form>
    </div>
  );
}
