"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RestaurantCard from "@/components/RestaurantCard";
import {
  Search,
  UtensilsCrossed,
  Store,
  Star,
  ArrowRight,
  ChefHat,
  Pizza,
  Salad,
  Coffee,
  Beef,
  Fish,
  Soup,
  Cake,
} from "lucide-react";

interface City {
  id: number;
  name: string;
  state: string | null;
  country: string;
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

const cuisineTypes = [
  { name: "Indian", icon: ChefHat, color: "bg-orange-50 text-orange-600" },
  { name: "Italian", icon: Pizza, color: "bg-red-50 text-red-600" },
  { name: "Chinese", icon: Soup, color: "bg-yellow-50 text-yellow-600" },
  { name: "Continental", icon: Beef, color: "bg-purple-50 text-purple-600" },
  { name: "Seafood", icon: Fish, color: "bg-blue-50 text-blue-600" },
  { name: "Healthy", icon: Salad, color: "bg-green-50 text-green-600" },
  { name: "Cafe", icon: Coffee, color: "bg-amber-50 text-amber-600" },
  { name: "Desserts", icon: Cake, color: "bg-pink-50 text-pink-600" },
];

export default function HomePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then(setCities)
      .catch(console.error);

    fetch("/api/restaurants?limit=6")
      .then((res) => res.json())
      .then((data) => setFeaturedRestaurants(data.restaurants || []))
      .catch(console.error);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    window.location.href = `/restaurants?${params.toString()}`;
  };

  return (
    <div>
      <section className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-food-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-gray-900/75 to-gray-900/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,53,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Discover{" "}
              <span className="text-primary-400">Amazing Food</span>{" "}
              Places Near You
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              Explore the best restaurants, cafes, and food joints in your city.
              Browse menus, read reviews, and find your next favorite spot.
            </p>

            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="flex-shrink-0 px-4 py-3 rounded-xl text-gray-700 bg-gray-50 border-0 focus:ring-2 focus:ring-primary-400 outline-none text-sm sm:w-40"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id.toString()}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-700 bg-gray-50 border-0 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-500 transition-colors flex-shrink-0"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Browse by Cuisine
          </h2>
          <p className="text-gray-500">
            Explore food places by your favorite cuisine type
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {cuisineTypes.map(({ name, icon: Icon, color }) => (
            <Link
              key={name}
              href={`/restaurants?cuisine=${name}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div
                className={`w-14 h-14 rounded-full ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-medium text-gray-700">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredRestaurants.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Popular Restaurants
                </h2>
                <p className="text-gray-500">
                  Top-rated food places loved by the community
                </p>
              </div>
              <Link
                href="/restaurants"
                className="hidden sm:flex items-center gap-1 text-primary-400 font-medium hover:text-primary-500 transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/restaurants"
                className="inline-flex items-center gap-1 text-primary-400 font-medium"
              >
                View All Restaurants <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-500">
            For business owners looking to grow their presence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Store,
              title: "Create Your Listing",
              description:
                "Sign in and add your restaurant with details like menu, photos, and operating hours.",
              color: "text-primary-400 bg-primary-50",
            },
            {
              icon: UtensilsCrossed,
              title: "Showcase Your Menu",
              description:
                "Add your full menu with prices, categories, and dietary options for customers to browse.",
              color: "text-secondary-500 bg-secondary-50",
            },
            {
              icon: Star,
              title: "Grow Your Business",
              description:
                "Get discovered by food lovers, receive reviews, and build your reputation in the community.",
              color: "text-amber-500 bg-amber-50",
            },
          ].map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5`}
              >
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {title}
              </h3>
              <p className="text-gray-500">{description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <a
            href="/register"
            className="inline-flex items-center gap-2 bg-primary-400 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-500 transition-colors text-lg"
          >
            List Your Restaurant <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
