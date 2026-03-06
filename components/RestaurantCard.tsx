"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";

interface RestaurantCardProps {
  id: number;
  name: string;
  slug: string;
  cuisineType: string;
  priceRange: number;
  averageRating: string | null;
  totalReviews: number | null;
  address: string;
  cityName?: string | null;
  photos?: { url: string; isPrimary: boolean | null }[];
  isFeatured?: boolean | null;
}

export default function RestaurantCard({
  id,
  name,
  cuisineType,
  priceRange,
  averageRating,
  totalReviews,
  address,
  cityName,
  photos,
  isFeatured,
}: RestaurantCardProps) {
  const primaryPhoto = photos?.find((p) => p.isPrimary) || photos?.[0];
  const rating = parseFloat(averageRating || "0");

  return (
    <Link href={`/restaurants/${id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100">
        <div className="relative h-48 overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-primary-400 text-4xl font-bold">
                {name[0]}
              </span>
            </div>
          )}
          {isFeatured && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {"$".repeat(priceRange)}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-400 transition-colors line-clamp-1">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-600 rounded-full">
              {cuisineType}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="font-medium text-gray-700">
                {rating > 0 ? rating.toFixed(1) : "New"}
              </span>
              {totalReviews && totalReviews > 0 && (
                <span>({totalReviews})</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1 text-xs">{cityName || address}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
