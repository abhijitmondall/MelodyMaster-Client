"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ShieldAlert,
  CheckSquare,
  History,
  Music,
  BarChart3,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = { label: string; href: string; icon: React.ElementType };

const navByRole: Record<Role, NavItem[]> = {
  Admin: [
    { label: "Overview", href: "/dashboard", icon: BarChart3 },
    {
      label: "Manage Users",
      href: "/dashboard/admin/manage-users",
      icon: Users,
    },
    {
      label: "Manage Classes",
      href: "/dashboard/admin/manage-classes",
      icon: BookOpen,
    },
  ],
  Instructor: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "My Classes",
      href: "/dashboard/instructor/my-classes",
      icon: BookMarked,
    },
    {
      label: "Add Class",
      href: "/dashboard/instructor/add-class",
      icon: PlusCircle,
    },
  ],
  Student: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Selected Classes",
      href: "/dashboard/student/selected-classes",
      icon: CheckSquare,
    },
    {
      label: "Enrolled Classes",
      href: "/dashboard/student/enrolled-classes",
      icon: GraduationCap,
    },
    {
      label: "Payment History",
      href: "/dashboard/student/payment-history",
      icon: History,
    },
  ],
};

const roleStyle: Record<
  Role,
  { bg: string; text: string; icon: React.ElementType; badge: string }
> = {
  Admin: {
    bg: "bg-indigo-600",
    text: "text-indigo-600",
    icon: ShieldAlert,
    badge: "bg-indigo-50 text-indigo-700",
  },
  Instructor: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    icon: Music,
    badge: "bg-amber-50 text-amber-700",
  },
  Student: {
    bg: "bg-primary",
    text: "text-primary",
    icon: GraduationCap,
    badge: "bg-primary/10 text-primary",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isLoading && user) {
      const allowedByPath = () => {
        if (pathname.startsWith("/dashboard/admin") && user.role !== "Admin")
          return false;
        if (
          pathname.startsWith("/dashboard/instructor") &&
          user.role !== "Instructor"
        )
          return false;
        if (
          pathname.startsWith("/dashboard/student") &&
          user.role !== "Student"
        )
          return false;
        return true;
      };

      if (!allowedByPath()) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading || !user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-primary" />
      </div>
    );

  const navItems = navByRole[user.role] ?? navByRole.Student;
  const style = roleStyle[user.role] ?? roleStyle.Student;
  const RoleIcon = style.icon;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div
          className={cn(
            "h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-lg",
            style.bg,
          )}
        >
          <RoleIcon size={20} />
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">
            MelodyMasters
          </span>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              style.text,
            )}
          >
            {user.role} Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl text-sm font-bold bg-slate-950 text-white hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Music size={18} className="text-teal-400" /> Go to Site
        </Link>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
          Navigation
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                isActive
                  ? cn("shadow-sm", style.badge)
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <item.icon
                size={18}
                className={isActive ? style.text : "text-slate-400"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      {/* User card */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-2xl border border-slate-100">
          <Avatar className="h-9 w-9">
            {user.photo && <AvatarImage src={user.photo} alt={user.name} />}
            <AvatarFallback
              className={cn("text-xs font-bold text-white", style.bg)}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold"
        >
          <LogOut size={16} /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-64 bg-white">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100">
          <div
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-black",
              style.bg,
            )}
          >
            M
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
