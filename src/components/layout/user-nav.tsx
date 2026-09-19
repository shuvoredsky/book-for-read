"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  BookOpen,
  Shield,
  User,
  LogIn,
  UserPlus,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("সফলভাবে লগআউট হয়েছে");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("লগআউট করতে সমস্যা হয়েছে");
    }
  };

  // 1. Logged-out Visitor State (User Icon with Dropdown)
  if (!session?.user && !isPending) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full border border-border/70 hover:bg-muted"
            aria-label="ইউজার মেনু"
          >
            <User className="h-4 w-4 text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52" align="end" forceMount>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            একাউন্ট মেনু
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/login" className="cursor-pointer flex items-center">
                <LogIn className="mr-2 h-4 w-4 text-primary" />
                <span>লগইন (Login)</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="cursor-pointer flex items-center">
                <UserPlus className="mr-2 h-4 w-4 text-primary" />
                <span>রেজিস্ট্রেশন (Register)</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/rules" className="cursor-pointer flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>নিয়মাবলী / ব্যবহারবিধি</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Fallback while loading
  if (!session?.user) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-60">
        <User className="h-4 w-4" />
      </Button>
    );
  }

  // 2. Logged-in Authenticated User State
  const user = session.user;
  const userRole = (user as unknown as { role?: string })?.role;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "BG";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 border border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
          aria-label="ব্যবহারকারী একাউন্ট"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              <span>ড্যাশবোর্ড (Dashboard)</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/rules" className="cursor-pointer flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>নিয়মাবলী / ব্যবহারবিধি</span>
            </Link>
          </DropdownMenuItem>
          {userRole === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="cursor-pointer flex items-center text-purple-600 dark:text-purple-400 font-medium"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>এডমিন প্যানেল (Admin)</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>লগআউট (Logout)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
