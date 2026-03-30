"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  CheckSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import {
  classesApi,
  usersApi,
  selectedClassesApi,
  enrolledUsersApi,
} from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-black mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: classesData } = useQuery({
    queryKey: ["all-classes"],
    queryFn: () => classesApi.getAll({ limit: 5, sort: "-createdAt" }),
    enabled: user?.role === "Admin" || user?.role === "Instructor",
  });

  const { data: usersData } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => usersApi.getAll({ limit: 5 }),
    enabled: user?.role === "Admin",
  });

  const { data: selectedData } = useQuery({
    queryKey: ["selected-classes", user?.email],
    queryFn: () => selectedClassesApi.getAll(user?.email),
    enabled: user?.role === "Student" && !!user?.email,
  });

  const { data: enrolledData } = useQuery({
    queryKey: ["enrolled-users", user?.email],
    queryFn: () => enrolledUsersApi.getAll(user?.email),
    enabled: user?.role === "Student" && !!user?.email,
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Good day, {user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your {user.role.toLowerCase()} portal.
        </p>
      </div>

      {/* Stats grid */}
      {user.role === "Admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Classes"
            value={classesData?.total ?? "—"}
            icon={BookOpen}
            color="bg-primary"
          />
          <StatCard
            title="Total Users"
            value={usersData?.total ?? "—"}
            icon={Users}
            color="bg-indigo-500"
          />
          <StatCard
            title="Instructors"
            value={
              usersData?.data?.filter((u) => u.role === "Instructor").length ??
              "—"
            }
            icon={TrendingUp}
            color="bg-amber-500"
          />
          <StatCard
            title="Students"
            value={
              usersData?.data?.filter((u) => u.role === "Student").length ?? "—"
            }
            icon={GraduationCap}
            color="bg-emerald-500"
          />
        </div>
      )}

      {user.role === "Instructor" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="My Classes"
            value={user.classes}
            icon={BookOpen}
            color="bg-amber-500"
          />
          <StatCard
            title="Total Students"
            value={user.students}
            icon={Users}
            color="bg-primary"
          />
          <StatCard
            title="Approved Classes"
            value={
              classesData?.data?.filter((c) => c.status === "Approved")
                .length ?? "—"
            }
            icon={CheckSquare}
            color="bg-emerald-500"
          />
        </div>
      )}

      {user.role === "Student" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Selected Classes"
            value={selectedData?.total ?? 0}
            icon={CheckSquare}
            color="bg-primary"
          />
          <StatCard
            title="Enrolled Classes"
            value={enrolledData?.total ?? 0}
            icon={GraduationCap}
            color="bg-emerald-500"
          />
          <StatCard
            title="Total Spent"
            value={formatPrice(
              (Array.isArray(enrolledData?.data)
                ? enrolledData.data
                : []
              ).reduce((s, e) => s + (e.price ?? 0), 0),
            )}
            icon={DollarSign}
            color="bg-amber-500"
          />
        </div>
      )}

      {/* Recent table */}
      {(user.role === "Admin" || user.role === "Instructor") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-3 pr-4 font-semibold">Class</th>
                    <th className="pb-3 pr-4 font-semibold">Instructor</th>
                    <th className="pb-3 pr-4 font-semibold">Price</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {classesData?.data?.slice(0, 5).map((cls) => (
                    <tr
                      key={cls.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium">{cls.className}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {cls.instructorName ?? "—"}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {formatPrice(cls.price)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            cls.status === "Approved"
                              ? "success"
                              : cls.status === "Denied"
                                ? "destructive"
                                : "warning"
                          }
                          className="text-xs"
                        >
                          {cls.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(cls.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === "Student" && enrolledData?.data?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrolledData.data.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-semibold text-sm">{e.className}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(e.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatPrice(e.price)}
                    </p>
                    <Badge variant="success" className="text-xs mt-1">
                      {e.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
