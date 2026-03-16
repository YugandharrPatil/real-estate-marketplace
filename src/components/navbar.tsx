"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton, SignInButton, useUser } from "@clerk/nextjs";
import {
  Building2,
  MapPin,
  Heart,
  CalendarCheck,
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const clientLinks = [
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/visits", label: "Visits", icon: CalendarCheck },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/chats", label: "Chats", icon: MessageSquare },
  { href: "/admin/requests", label: "Visit Requests", icon: CalendarCheck },
  { href: "/admin/inquiries", label: "Inquiries", icon: FileQuestion },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.publicMetadata?.role as string;
  const isAdmin = role === "admin";
  const navLinks = isAdmin ? adminLinks : clientLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Building2 className="h-6 w-6 text-primary" />
          <span>EstateHub {isAdmin && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">Admin</span>}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === href || (href !== "/" && pathname.startsWith(href + "/")) || (href === "/admin" && pathname === "/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth + Mobile toggle */}
        <div className="flex items-center gap-3">
          {!isSignedIn && (
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link href="/admin-login">Login as Admin</Link>
            </Button>
          )}
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </SignInButton>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pathname === href || (href !== "/" && pathname.startsWith(href + "/")) || (href === "/admin" && pathname === "/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {!isSignedIn && (
            <Link
              href="/admin-login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Login as Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
