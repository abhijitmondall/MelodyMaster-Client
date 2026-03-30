"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Music, Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Student", "Instructor"]),
});

export default function SignupPage() {
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Student" as "Student" | "Instructor",
    },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        const result = await authApi.signup(value);
        login(result.user, result.tokens);
        router.push("/dashboard");
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        setServerError(msg);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30">
            <Music className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            MelodyMasters
          </span>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black">
              Create your account
            </CardTitle>
            <CardDescription>
              Join thousands of music lovers worldwide
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Name */}
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    const r = schema.shape.name.safeParse(value);
                    return r.success ? undefined : r.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Doe"
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

              {/* Email */}
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const r = schema.shape.email.safeParse(value);
                    return r.success ? undefined : r.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
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
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    const r = schema.shape.password.safeParse(value);
                    return r.success ? undefined : r.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={`pr-10 ${field.state.meta.errors.length ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPass ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Role */}
              <form.Field name="role">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>I want to join as</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) =>
                        field.handleChange(v as "Student" | "Instructor")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">
                          🎓 Student — I want to learn
                        </SelectItem>
                        <SelectItem value="Instructor">
                          🎸 Instructor — I want to teach
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                    className="w-full mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Creating account…
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
