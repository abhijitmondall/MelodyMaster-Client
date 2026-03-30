"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, UserCog } from "lucide-react";
import { usersApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials } from "@/lib/utils";
import type { Role, User } from "@/types";

const roleBadge: Record<Role, "default" | "warning" | "info"> = {
  Admin: "default", Instructor: "warning", Student: "info",
};

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { search, roleFilter }],
    queryFn: () => usersApi.getAll({
      search: search || undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      limit: 50,
    }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.update(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Manage Users</h1>
        <p className="text-muted-foreground mt-1">View and manage all registered users.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "all")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Student">Students</SelectItem>
            <SelectItem value="Instructor">Instructors</SelectItem>
            <SelectItem value="Admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.total ?? 0} users found`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                      </tr>
                    ))
                  : data?.data?.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {user.photo && <AvatarImage src={user.photo} />}
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={roleBadge[user.role] ?? "default"}>{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(v) => updateRole.mutate({ id: user.id, role: v as Role })}
                            >
                              <SelectTrigger className="h-8 w-32 text-xs rounded-lg">
                                <UserCog className="h-3.5 w-3.5 mr-1" /><SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Instructor">Instructor</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => { if (confirm(`Delete ${user.name}?`)) deleteUser.mutate(user.id); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
