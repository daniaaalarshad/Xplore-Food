"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/layout";
import {
  Menu,
  X,
  UtensilsCrossed,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-primary-400" />
            <span className="text-xl font-bold text-gray-900">
              Xplore <span className="text-primary-400">Food</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-400 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/restaurants"
              className="text-gray-600 hover:text-primary-400 font-medium transition-colors"
            >
              Restaurants
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-primary-400 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-400 transition-colors"
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-400 text-white flex items-center justify-center text-sm font-medium">
                      {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.firstName || "User"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <a
                        href="/api/logout"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/api/login"
                className="bg-primary-400 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-500 transition-colors"
              >
                Sign In
              </a>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block py-2 text-gray-600 hover:text-primary-400 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/restaurants"
              className="block py-2 text-gray-600 hover:text-primary-400 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Restaurants
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="block py-2 text-gray-600 hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2 border-t">
              {isAuthenticated ? (
                <a
                  href="/api/logout"
                  className="block py-2 text-gray-600 hover:text-primary-400 font-medium"
                >
                  Sign Out
                </a>
              ) : (
                <a
                  href="/api/login"
                  className="block py-2 text-primary-400 font-medium"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
