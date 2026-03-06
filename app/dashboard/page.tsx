"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/layout";
import {
  Plus,
  Edit,
  Trash2,
  UtensilsCrossed,
  Star,
  Eye,
  LayoutDashboard,
} from "lucide-react";

interface DashboardRestaurant {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  cityName: string | null;
  cuisineType: string;
  priceRange: number;
  averageRating: string | null;
  totalReviews: number | null;
  isVerified: boolean | null;
  photos: { url: string; isPrimary: boolean | null }[];
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<DashboardRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/dashboard/restaurants", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setRestaurants(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    try {
      const res = await fetch(`/api/dashboard/restaurants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-3 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <LayoutDashboard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Business Dashboard
        </h2>
        <p className="text-gray-500 mb-6">
          Sign in to manage your restaurant listings
        </p>
        <a
          href="/api/login"
          className="inline-block bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-500 transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, {user?.firstName || "Business Owner"}
          </p>
        </div>
        <Link
          href="/dashboard/add"
          className="bg-primary-400 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Restaurant
        </Link>
      </div>

      {restaurants.length > 0 ? (
        <div className="space-y-4">
          {restaurants.map((restaurant) => {
            const primaryPhoto =
              restaurant.photos.find((p) => p.isPrimary) ||
              restaurant.photos[0];
            const rating = parseFloat(restaurant.averageRating || "0");

            return (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-5"
              >
                <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto.url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-primary-400 text-2xl font-bold">
                        {restaurant.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                          {restaurant.cuisineType}
                        </span>
                        <span>{"$".repeat(restaurant.priceRange)}</span>
                        {restaurant.cityName && (
                          <span>{restaurant.cityName}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium">
                        {rating > 0 ? rating.toFixed(1) : "New"}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({restaurant.totalReviews || 0})
                      </span>
                    </div>
                  </div>

                  {restaurant.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="text-sm text-gray-600 hover:text-primary-400 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    <Link
                      href={`/dashboard/edit/${restaurant.id}`}
                      className="text-sm text-gray-600 hover:text-primary-400 flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Link>
                    <Link
                      href={`/dashboard/menu/${restaurant.id}`}
                      className="text-sm text-gray-600 hover:text-primary-400 flex items-center gap-1"
                    >
                      <UtensilsCrossed className="h-4 w-4" /> Menu
                    </Link>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No restaurants yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding your first restaurant listing
          </p>
          <Link
            href="/dashboard/add"
            className="inline-flex items-center gap-2 bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-500 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Restaurant
          </Link>
        </div>
      )}
    </div>
  );
}
