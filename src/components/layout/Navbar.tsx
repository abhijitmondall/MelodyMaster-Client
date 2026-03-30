"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Music,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { getInitials, cn } from "@/lib/utils";
import { classesApi } from "@/lib/api";
import type { Class } from "@/types";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/instructors", label: "Instructors" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["global-class-search", searchQuery],
    queryFn: async () => {
      const response = await classesApi.getAll({
        search: searchQuery.trim(),
        status: "Approved",
        limit: 5,
      });
      return response.data ?? [];
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/classes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-black text-xl tracking-tight text-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Music className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">MelodyMasters</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150",
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        {/* Global search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex relative items-center flex-1 max-w-md mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(searchQuery.trim().length >= 2)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e as any);
                }
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-150"
            />
          </div>

          {showSuggestions && searchQuery.trim().length >= 2 && (
            <div className="absolute top-12 left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {isFetching && (
                <p className="text-sm text-slate-500 py-2">Searching...</p>
              )}
              {!isFetching && suggestions.length === 0 && (
                <p className="text-sm text-slate-500 py-2">No results found</p>
              )}
              <div className="space-y-1">
                {suggestions.slice(0, 5).map((cls: Class) => (
                  <button
                    key={cls.id}
                    type="button"
                    onMouseDown={() => {
                      router.push(`/classes/${cls.id}`);
                      setShowSuggestions(false);
                    }}
                    className="flex items-center justify-between w-full text-left rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <span className="truncate">{cls.className}</span>
                    <span className="text-xs text-slate-400">{cls.price}$</span>
                  </button>
                ))}
              </div>
              {suggestions.length > 0 && (
                <button
                  type="button"
                  onMouseDown={() => {
                    router.push(
                      `/classes?search=${encodeURIComponent(searchQuery.trim())}`,
                    );
                    setShowSuggestions(false);
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  View all
                </button>
              )}
            </div>
          )}
        </form>
        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Avatar className="h-8 w-8">
                    {user.photo && (
                      <AvatarImage src={user.photo} alt={user.name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-semibold max-w-25 truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <span className="inline-flex w-fit mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-600 hover:text-slate-900"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-lg px-4 py-2">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                  pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full mt-2 rounded-lg"
              >
                Search
              </Button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
