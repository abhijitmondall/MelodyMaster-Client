"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { BookOpen, Edit, Trash2, Loader2 } from "lucide-react";
import { classesApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Class } from "@/types";

export default function MyClassesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    className: "",
    classImage: "",
    description: "",
    totalSeats: 0,
    price: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-classes", user?.email],
    queryFn: () => classesApi.getAll({ search: user?.email }),
    enabled: !!user?.email,
  });

  const deleteClass = useMutation({
    mutationFn: classesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-classes"] });
      showToast("Class deleted successfully", "success");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete class";
      showToast(msg, "error");
    },
  });

  const updateClass = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<
        Pick<
          Class,
          "className" | "classImage" | "description" | "totalSeats" | "price"
        >
      >;
    }) => classesApi.update(id, payload as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-classes"] });
      setIsEditOpen(false);
      setEditingClass(null);
      showToast("Class updated successfully", "success");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update class";
      showToast(msg, "error");
    },
  });

  const myClasses =
    data?.data?.filter((c) => c.instructorEmail === user?.email) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">My Classes</h1>
        <p className="text-muted-foreground mt-1">
          All classes you have submitted and their approval status.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 rounded-t-2xl rounded-b-none" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : myClasses.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">
              You haven't added any classes yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.map((cls) => (
            <Card key={cls.id} className="overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-teal-50 to-emerald-100">
                {cls.classImage ? (
                  <Image
                    src={cls.classImage}
                    alt={cls.className}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      cls.status === "Approved"
                        ? "success"
                        : cls.status === "Denied"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {cls.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold leading-tight">{cls.className}</h3>
                {cls.feedback && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    <span className="font-bold">Feedback:</span> {cls.feedback}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-1 border-t border-border">
                  <span>{cls.enrolledStudents} enrolled</span>
                  <span className="font-bold text-primary">
                    {formatPrice(cls.price)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(cls.createdAt)}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditingClass(cls);
                      setEditForm({
                        className: cls.className,
                        classImage: cls.classImage ?? "",
                        description: cls.description ?? "",
                        totalSeats: cls.totalSeats,
                        price: cls.price,
                      });
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setDeleteId(cls.id);
                      setIsDeleteConfirmOpen(true);
                    }}
                    disabled={deleteClass.isPending}
                  >
                    {deleteClass.isPending ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update your class details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label>Class Name</Label>
              <Input
                value={editForm.className}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    className: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Class Image URL</Label>
              <Input
                value={editForm.classImage}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    classImage: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Total Seats</Label>
                <Input
                  type="number"
                  value={editForm.totalSeats}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      totalSeats: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!editingClass || updateClass.isPending}
              onClick={() => {
                if (!editingClass) return;
                updateClass.mutate({
                  id: editingClass.id,
                  payload: {
                    className: editForm.className,
                    classImage: editForm.classImage || undefined,
                    description: editForm.description,
                    totalSeats: editForm.totalSeats,
                    price: editForm.price,
                  },
                });
              }}
            >
              {updateClass.isPending ? "Updating..." : "Update class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteId || deleteClass.isPending}
              onClick={() => {
                if (!deleteId) return;
                deleteClass.mutate(deleteId, {
                  onSettled: () => {
                    setDeleteId(null);
                    setIsDeleteConfirmOpen(false);
                  },
                });
              }}
            >
              {deleteClass.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
