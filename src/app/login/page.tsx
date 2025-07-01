import { SubmitButton } from "@/src/components/ui/submit-button";
import { Input } from "@/src/components/ui/input";
import { createClient } from "@/src/lib/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OAuthErrorHandler, MicrosoftOAuthButton } from "@/src/components/login";

export default async function Login({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ message: string; returnUrl?: string }>;
}>) {
  const params = await searchParams;

  const signIn = async (_prevState: any, formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return redirect(`/login?message=Could not authenticate user&returnUrl=${params.returnUrl}`);
    }

    return redirect(params.returnUrl ?? "/dashboard");
  };

  const signUp = async (_prevState: any, formData: FormData) => {
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

    if (error) {
      return redirect(`/login?message=Could not authenticate user&returnUrl=${params.returnUrl}`);
    }

    return redirect(`/login?message=Check email to continue sign in process&returnUrl=${params.returnUrl}`);
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
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

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <OAuthErrorHandler />
        <div className="flex w-full flex-col gap-2">
          <MicrosoftOAuthButton returnUrl={params.returnUrl} />
        </div>
        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <Input
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
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
        <SubmitButton
          formAction={signIn}
          pendingText="Signing In..."
        >
          Sign In
        </SubmitButton>
        <SubmitButton
          formAction={signUp}
          variant="outline"
          pendingText="Signing Up..."
        >
          Sign Up
        </SubmitButton>
        {params?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {params.message}
          </p>
        )}
      </form>
    </div>
  );
}
