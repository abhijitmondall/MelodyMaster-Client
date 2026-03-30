"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Music,
  GraduationCap,
  Receipt,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { paymentApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { VerifySessionResponse } from "@/types";

// ── Inner component (reads searchParams) ──────────────────────────────────────
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = useState<VerifySessionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No session ID found in the URL. This page should only be visited after completing a Stripe payment.");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const data = await paymentApi.verifySession(sessionId);
        if (cancelled) return;
        setResult(data);
        setStatus("success");

        // Refresh all enrollment-related queries so dashboards update instantly
        qc.invalidateQueries({ queryKey: ["selected-classes"] });
        qc.invalidateQueries({ queryKey: ["enrolled-users"] });
        qc.invalidateQueries({ queryKey: ["payment-history"] });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to verify your payment. Please check your enrolled classes.";
        setErrorMsg(msg);
        setStatus("error");
      }
    };

    void verify();
    return () => { cancelled = true; };
  }, [sessionId, qc]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-10 text-center space-y-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
            <p className="text-sm text-muted-foreground">Verifying your payment with Stripe…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-destructive/10 blur-3xl" />
        </div>
        <Card className="relative w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-10 text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black">Verification Failed</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/dashboard/student/enrolled-classes">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Check My Enrollments
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/student/selected-classes">Back to Cart</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4 py-12">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-4">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">MelodyMasters</span>
        </div>

        {/* Main card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Green top bar */}
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-400" />

          <CardContent className="p-8 space-y-6">
            {/* Icon + heading */}
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Payment Successful!</h1>
              <p className="text-muted-foreground text-sm">
                You are now enrolled. Start your musical journey today.
              </p>
            </div>

            {/* Enrollment detail card */}
            {result && (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{result.enrollment.className}</p>
                    <p className="text-xs text-muted-foreground">
                      Enrolled on {formatDateTime(result.enrollment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                      Paid
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount Paid</p>
                    <p className="font-black text-lg text-primary mt-0.5">
                      {formatPrice(result.amountPaid)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Billing Email</p>
                    <p className="font-semibold text-sm mt-0.5 truncate">
                      {result.customerEmail || result.enrollment.email}
                    </p>
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                  <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transaction ID</p>
                    <code className="text-xs font-mono text-slate-600 truncate block">
                      {result.enrollment.transactionId}
                    </code>
                  </div>
                </div>

                {/* Stripe receipt link */}
                {result.receiptUrl && (
                  <a
                    href={result.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    View Stripe Receipt
                  </a>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/dashboard/student/enrolled-classes">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Go to My Enrollments
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/classes">
                  Browse More Classes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-4">
          A confirmation has been recorded. You can view all transactions in your{" "}
          <Link href="/dashboard/student/payment-history" className="text-teal-400 hover:underline">
            Payment History
          </Link>.
        </p>
      </div>
    </div>
  );
}

// ── Page wrapper with Suspense for useSearchParams ────────────────────────────
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
