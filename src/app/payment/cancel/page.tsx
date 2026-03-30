"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, Music, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { paymentApi } from "@/lib/api";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const selectedClassId = searchParams.get("selectedClassId");
  const qc = useQueryClient();

  useEffect(() => {
    if (!selectedClassId) return;

    // Best-effort cleanup: remove the Pending enrollment created for checkout.
    // Even if this call fails, the UI will still treat only "Paid" as enrolled.
    paymentApi
      .cancelCheckout(selectedClassId)
      .then(() => {
        qc.invalidateQueries({ queryKey: ["enrolled-users"] });
        qc.invalidateQueries({ queryKey: ["payment-history"] });
      })
      .catch(() => {});
  }, [selectedClassId, qc]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-destructive/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-700/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-4">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            MelodyMasters
          </span>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Red-to-orange top bar */}
          <div className="h-2 bg-gradient-to-r from-rose-400 to-orange-400" />

          <CardContent className="p-8 space-y-6 text-center">
            {/* Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 mx-auto">
              <XCircle className="h-10 w-10 text-rose-500" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">
                Payment Cancelled
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You cancelled the Stripe checkout. Your class is still saved in
                your cart — no charge was made.
              </p>
            </div>

            {/* Info box */}
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800 text-left space-y-1.5">
              <p className="font-bold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Your cart is safe
              </p>
              <p className="text-xs leading-relaxed text-amber-700">
                The class you were about to pay for is still in your Selected
                Classes. You can return and try again whenever you are ready.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              {selectedClassId ? (
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/dashboard/student/selected-classes">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Return to Cart &amp; Retry
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/dashboard/student/selected-classes">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Go to My Cart
                  </Link>
                </Button>
              )}

              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/classes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Classes
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="rounded-xl text-muted-foreground text-sm"
              >
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-4">
          Having trouble? Contact us at{" "}
          <a
            href="mailto:hello@melodymasters.com"
            className="text-teal-400 hover:underline"
          >
            hello@melodymasters.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
