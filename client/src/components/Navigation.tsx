import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "@/components/NotificationCenter";

interface NavigationProps {
  user?: { email: string; role: string } | null;
  onLogout?: () => void;
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/resources", label: "Resources" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "Dashboard" });
    if (user.role === "admin") {
      navLinks.push({ href: "/admin", label: "Admin" });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" data-testid="link-home">
            <span className="flex items-center space-x-2 hover-elevate active-elevate-2 px-3 py-2 rounded-lg transition-colors cursor-pointer">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                JobApply.pro
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-${link.label.toLowerCase()}`}>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate active-elevate-2 cursor-pointer inline-block ${
                    location === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user && <NotificationCenter />}
            {user ? (
              <>
                <span className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  data-testid="button-logout"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="button-signin">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" data-testid="button-getstarted">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 hover-elevate active-elevate-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 px-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-mobile-${link.label.toLowerCase()}`}>
                <span
                  className={`block px-4 py-2 rounded-lg text-sm font-medium hover-elevate active-elevate-2 cursor-pointer ${
                    location === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground" data-testid="text-mobile-user-email">
                    {user.email}
                  </div>
                  <div className="px-4 py-2">
                    <NotificationCenter />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onLogout?.();
                      setMobileMenuOpen(false);
                    }}
                    data-testid="button-mobile-logout"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-mobile-signin"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-mobile-getstarted"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
