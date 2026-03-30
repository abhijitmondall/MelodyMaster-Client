"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Music, Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        const result = await authApi.signin(value);
        login(result.user, result.tokens);
        showToast("Signed in successfully.", "success");
        router.push("/dashboard");
      } catch (err: unknown) {
        let msg = "Invalid email or password. Please try again.";

        if (err instanceof Error) {
          msg = err.message || msg;
        }

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response === "object" &&
          (err as any).response !== null
        ) {
          const server = (err as any).response;
          if (server.data?.message) {
            msg = server.data.message;
          } else if (server.status === 401 || server.status === 403) {
            msg = "Invalid credentials. Please check your email and password.";
          }
        }

        setServerError(msg);
        showToast(msg, "error");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Music className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            MelodyMasters
          </span>
        </div>

        <Card className="rounded-3xl border border-slate-200 bg-white shadow-lg">
          <CardHeader className="border-b border-slate-100 pb-5">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to continue your musical journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              {/* Email */}
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const r = schema.shape.email.safeParse(value);
                    return r?.success
                      ? undefined
                      : r.error?.issues?.[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={
                        field.state.meta.errors.length
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Password */}
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>

              {serverError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <form.Subscribe selector={(s) => [s.isSubmitting]}>
                {([isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full mt-2 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Signing in…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-primary font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
