"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RestaurantCard from "@/components/RestaurantCard";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface City {
  id: number;
  name: string;
}

interface Restaurant {
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
  isFeatured: boolean | null;
  photos: { url: string; isPrimary: boolean | null }[];
}

const cuisineOptions = [
  "Indian",
  "Italian",
  "Chinese",
  "Continental",
  "Seafood",
  "Healthy",
  "Cafe",
  "Desserts",
  "Mexican",
  "Japanese",
  "Thai",
  "Fast Food",
];

export default function RestaurantsPage() {
  const searchParams = useSearchParams();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedCuisine, setSelectedCuisine] = useState(
    searchParams.get("cuisine") || ""
  );
  const [selectedPrice, setSelectedPrice] = useState(
    searchParams.get("priceRange") || ""
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then(setCities)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [page, selectedCity, selectedCuisine, selectedPrice]);

  const fetchRestaurants = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");
    if (search) params.set("search", search);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedCuisine) params.set("cuisine", selectedCuisine);
    if (selectedPrice) params.set("priceRange", selectedPrice);

    try {
      const res = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await res.json();
      setRestaurants(data.restaurants || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchRestaurants();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCity("");
    setSelectedCuisine("");
    setSelectedPrice("");
    setPage(1);
  };

  const hasActiveFilters =
    search || selectedCity || selectedCuisine || selectedPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Restaurants
        </h1>
        <p className="text-gray-500">
          {total} restaurant{total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-primary-400 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition-colors"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        <aside
          className={`${
            showFilters ? "block" : "hidden"
          } sm:block w-full sm:w-64 flex-shrink-0`}
        >
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-400 hover:text-primary-500"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id.toString()}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {cuisineOptions.map((cuisine) => (
                    <label
                      key={cuisine}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cuisine"
                        checked={selectedCuisine === cuisine}
                        onChange={() => {
                          setSelectedCuisine(
                            selectedCuisine === cuisine ? "" : cuisine
                          );
                          setPage(1);
                        }}
                        className="text-primary-400 focus:ring-primary-400"
                      />
                      <span className="text-sm text-gray-600">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((price) => (
                    <button
                      key={price}
                      onClick={() => {
                        setSelectedPrice(
                          selectedPrice === price.toString()
                            ? ""
                            : price.toString()
                        );
                        setPage(1);
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPrice === price.toString()
                          ? "bg-primary-400 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {"$".repeat(price)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} {...restaurant} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No restaurants found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-primary-400 font-medium hover:text-primary-500"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
