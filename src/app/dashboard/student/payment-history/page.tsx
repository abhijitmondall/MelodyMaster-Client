"use client";

import { useQuery } from "@tanstack/react-query";
import { History, DollarSign, TrendingUp, Receipt } from "lucide-react";
import { enrolledUsersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateTime } from "@/lib/utils";

export default function PaymentHistoryPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["payment-history", user?.email],
    queryFn: () => enrolledUsersApi.getAll(user?.email),
    enabled: !!user?.email,
  });

  const payments = Array.isArray(data?.data) ? data.data : [];
  const totalSpent = payments.reduce((s, p) => s + (p?.price ?? 0), 0);
  const avgPayment = payments.length ? totalSpent / payments.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Payment History</h1>
        <p className="text-muted-foreground mt-1">
          A complete record of all your transactions.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Transactions
              </p>
              <p className="text-2xl font-black">{payments.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Spent
              </p>
              <p className="text-2xl font-black">{formatPrice(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Avg. Payment
              </p>
              <p className="text-2xl font-black">{formatPrice(avgPayment)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <History className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">
                No transactions yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Enroll in a class to see your payment history here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">#</th>
                    <th className="px-6 py-3 font-semibold">Class</th>
                    <th className="px-6 py-3 font-semibold">Transaction ID</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold text-right">
                      Amount
                    </th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p, i) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{p.className}</p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-muted rounded-lg px-2 py-1 font-mono">
                          {p.transactionId.slice(0, 20)}
                          {p.transactionId.length > 20 ? "…" : ""}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-primary">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success" className="text-xs">
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Footer total */}
                <tfoot>
                  <tr className="bg-muted/40 border-t-2 border-border">
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-sm font-bold text-muted-foreground"
                    >
                      Total ({payments.length} transactions)
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-black text-primary">
                      {formatPrice(totalSpent)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
