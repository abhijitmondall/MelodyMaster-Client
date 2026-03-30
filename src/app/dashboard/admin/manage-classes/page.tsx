"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { classesApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Class } from "@/types";

export default function ManageClassesPage() {
  const [search, setSearch] = useState("");
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; classId: string; feedback: string }>({ open: false, classId: "", feedback: "" });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-classes", search],
    queryFn: () => classesApi.getAll({ search: search || undefined, limit: 100 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, feedback }: { id: string; status: "Approved" | "Denied"; feedback?: string }) =>
      classesApi.update(id, { status, feedback }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-classes"] }),
  });

  const handleApprove = (id: string) => updateStatus.mutate({ id, status: "Approved" });
  const handleDeny = () => {
    updateStatus.mutate({ id: feedbackDialog.classId, status: "Denied", feedback: feedbackDialog.feedback });
    setFeedbackDialog({ open: false, classId: "", feedback: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Manage Classes</h1>
        <p className="text-muted-foreground mt-1">Review, approve, or deny class submissions from instructors.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search classes…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-muted-foreground">{isLoading ? "Loading…" : `${data?.total ?? 0} classes`}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground text-xs uppercase tracking-wider">
                  {["Class", "Instructor", "Seats", "Price", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>)}</tr>
                    ))
                  : data?.data?.map((cls) => (
                      <tr key={cls.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{cls.className}</p>
                            {cls.feedback && <p className="text-xs text-destructive mt-0.5">Feedback: {cls.feedback}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{cls.instructorName ?? "—"}</td>
                        <td className="px-6 py-4">{cls.availableSeats} / {cls.totalSeats}</td>
                        <td className="px-6 py-4 font-semibold">{formatPrice(cls.price)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={cls.status === "Approved" ? "success" : cls.status === "Denied" ? "destructive" : "warning"}>{cls.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(cls.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {cls.status !== "Approved" && (
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={() => handleApprove(cls.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                            )}
                            {cls.status !== "Denied" && (
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:bg-destructive/10 rounded-lg"
                                onClick={() => setFeedbackDialog({ open: true, classId: cls.id, feedback: "" })}>
                                <XCircle className="h-3.5 w-3.5" /> Deny
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Feedback dialog */}
      <Dialog open={feedbackDialog.open} onOpenChange={(o) => setFeedbackDialog((p) => ({ ...p, open: o }))}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Deny Class — Add Feedback</DialogTitle></DialogHeader>
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Provide feedback for the instructor…"
            value={feedbackDialog.feedback}
            onChange={(e) => setFeedbackDialog((p) => ({ ...p, feedback: e.target.value }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog({ open: false, classId: "", feedback: "" })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeny}>Deny Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
