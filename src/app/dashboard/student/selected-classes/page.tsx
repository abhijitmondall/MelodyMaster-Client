"use client";

import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  BookOpen,
  CreditCard,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { selectedClassesApi, paymentApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import type { SelectedClass } from "@/types";

export default function SelectedClassesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["selected-classes", user?.email],
    queryFn: () => selectedClassesApi.getAll(user?.email),
    enabled: !!user?.email,
  });

  const deleteSelected = useMutation({
    mutationFn: selectedClassesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["selected-classes"] }),
  });

  // ── Stripe Checkout redirect ───────────────────────────────────────────────
  const handleCheckout = async (sc: SelectedClass) => {
    if (!user) return;
    setCheckingOutId(sc.id);
    setCheckoutError(null);

    try {
      const { paymentUrl } = await paymentApi.createCheckout(sc.id);
      // Redirect to Stripe-hosted checkout page
      window.location.assign(paymentUrl);
    } catch (err: unknown) {
      let msg = "Failed to create checkout session. Please try again.";

      if (err instanceof Error) {
        msg = err.message;
      }

      // Axios error body may contain useful message from server
      if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: any } }).response;
        if (resp?.data?.message) {
          msg = resp.data.message;
        }
      }

      if (msg === "You are already enrolled in this class.") {
        qc.invalidateQueries({ queryKey: ["selected-classes"] });
      }

      setCheckoutError(msg);
      setCheckingOutId(null);
    }
  };

  const selectedClasses = data?.data ?? [];
  const total = selectedClasses.reduce((s, sc) => s + sc.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Selected Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Classes you&apos;ve saved. Click <strong>Pay Now</strong> to
            securely enroll via Stripe.
          </p>
        </div>
        {selectedClasses.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Cart Total
            </p>
            <p className="text-2xl font-black text-primary">
              {formatPrice(total)}
            </p>
          </div>
        )}
      </div>

      {/* Error banner */}
      {checkoutError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-start gap-2">
          <span className="font-bold shrink-0">Error:</span>
          <span>{checkoutError}</span>
          <button
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={() => setCheckoutError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stripe badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 w-fit">
        <svg
          className="h-4 w-4"
          viewBox="0 0 60 25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10 10 0 0 1-4.56 1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.58zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.45.94V6.27h3.96l.26 1.04a4.36 4.36 0 0 1 3.23-1.32c2.83 0 5.56 2.53 5.56 7.26 0 5.13-2.7 7.05-5.64 7.05zM40 9.95c-.95 0-1.54.34-1.94.81l.02 6.12c.4.44.98.78 1.92.78 1.49 0 2.5-1.67 2.5-3.87 0-2.18-1.03-3.84-2.5-3.84zM28.24 5.07c1.44 0 2.3 1.04 2.3 2.4 0 1.4-.9 2.4-2.3 2.4-1.41 0-2.3-.96-2.3-2.4 0-1.36.9-2.4 2.3-2.4zm2.22 15.27h-4.47V6.27h4.47v14.07zM23.48 6.27v1.5c-.8-1.04-2.17-1.75-3.82-1.75-3.1 0-5.83 2.64-5.83 7.27 0 4.36 2.53 7.04 5.83 7.04 1.5 0 2.8-.56 3.6-1.47l.04 1.07c.04.96-.6 1.77-2.05 1.77-1.03 0-2.13-.36-2.7-.73V24a10.83 10.83 0 0 0 3.5.59c4.11 0 6.37-2.02 6.37-6.31V6.27h-4.94zm-2.96 10.45c-1.53 0-2.5-1.3-2.5-3.44 0-2.16.96-3.46 2.5-3.46 1.1 0 1.87.56 2.3 1.27v4.4c-.43.71-1.2 1.23-2.3 1.23zM8.69 9.15c1.56 0 2.5.65 2.5 1.46 0 1.23-1.14 1.6-3.26 2.1C5.6 13.28 3 14.34 3 17.7c0 2.63 1.99 4.3 5.1 4.3 1.97 0 3.77-.6 5.08-1.55l.04.04v1.27h4.12V12.4c0-3.87-2.82-6.39-7.07-6.39-2.2 0-4.22.5-5.86 1.38v3.65c1.36-.83 3.04-1.39 4.88-1.39l-.6-.5zm.26 9.02c-1.01 0-1.6-.44-1.6-1.22 0-1.07 1-1.5 2.62-1.94l.33-.09v2.24c-.38.59-1.01 1.01-1.35 1.01z"
            fill="#6B7280"
          />
        </svg>
        <span>Powered by Stripe · 256-bit SSL encryption</span>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex gap-4">
                <Skeleton className="h-24 w-36 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-2 shrink-0">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedClasses.length === 0 ? (
        /* Empty state */
        <Card className="text-center py-20">
          <CardContent>
            <BookOpen className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-bold text-lg">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse the <strong>Classes</strong> page and click{" "}
              <strong>Select</strong> to add courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Class list */
        <div className="space-y-4">
          {selectedClasses.map((sc) => (
            <Card
              key={sc.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start">
                  {/* Thumbnail */}
                  <div className="relative h-28 w-full sm:w-36 shrink-0 bg-gradient-to-br from-teal-50 to-emerald-100">
                    {sc.classImage ? (
                      <Image
                        src={sc.classImage}
                        alt={sc.className}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary/30" />
                      </div>
                    )}
                  </div>

                  {/* Info + Actions */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base leading-snug">
                        {sc.className}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {sc.instructorEmail}
                      </p>
                      <Badge variant="info" className="text-xs">
                        {sc.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                      <span className="text-xl font-black text-primary">
                        {formatPrice(sc.price)}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-xl gap-1.5 shadow-sm"
                          disabled={checkingOutId === sc.id}
                          onClick={() => handleCheckout(sc)}
                        >
                          {checkingOutId === sc.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Redirecting…
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3.5 w-3.5" />
                              Pay Now
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteSelected.mutate(sc.id)}
                          disabled={
                            deleteSelected.isPending || checkingOutId === sc.id
                          }
                          title="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
