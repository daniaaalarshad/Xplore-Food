"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout";
import { ArrowLeft, Save } from "lucide-react";

interface City {
  id: number;
  name: string;
  state: string | null;
}

const cuisineOptions = [
  "Indian", "Italian", "Chinese", "Continental", "Seafood",
  "Healthy", "Cafe", "Desserts", "Mexican", "Japanese",
  "Thai", "Fast Food", "Korean", "Mediterranean", "American",
];

const dietaryOptionsList = [
  "Vegetarian Friendly", "Vegan Options", "Gluten-Free Options",
  "Halal", "Kosher", "Organic",
];

const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function AddRestaurantPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    cityId: "",
    phone: "",
    email: "",
    website: "",
    cuisineType: "",
    priceRange: "2",
    dietaryOptions: [] as string[],
    operatingHours: {} as Record<string, { open: string; close: string; closed?: boolean }>,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then(setCities)
      .catch(console.error);
  }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDietary = (option: string) => {
    setForm((prev) => ({
      ...prev,
      dietaryOptions: prev.dietaryOptions.includes(option)
        ? prev.dietaryOptions.filter((o) => o !== option)
        : [...prev.dietaryOptions, option],
    }));
  };

  const updateHours = (day: string, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: { ...prev.operatingHours[day], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.cityId || !form.cuisineType) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create restaurant");
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert("Failed to create restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Add New Restaurant
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type *
                </label>
                <select
                  value={form.cuisineType}
                  onChange={(e) => updateField("cuisineType", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                  required
                >
                  <option value="">Select Cuisine</option>
                  {cuisineOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => updateField("priceRange", price.toString())}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        form.priceRange === price.toString()
                          ? "bg-primary-400 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {"$".repeat(price)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Location & Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <select
                value={form.cityId}
                onChange={(e) => updateField("cityId", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id.toString()}>
                    {city.name}{city.state ? `, ${city.state}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dietary Options
          </h2>
          <div className="flex flex-wrap gap-2">
            {dietaryOptionsList.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleDietary(option)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.dietaryOptions.includes(option)
                    ? "bg-secondary-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Operating Hours
          </h2>
          <div className="space-y-3">
            {dayNames.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700 capitalize">
                  {day}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.operatingHours[day]?.closed || false}
                    onChange={(e) => updateHours(day, "closed", e.target.checked)}
                    className="text-red-500"
                  />
                  <span className="text-sm text-gray-500">Closed</span>
                </label>
                {!form.operatingHours[day]?.closed && (
                  <>
                    <input
                      type="time"
                      value={form.operatingHours[day]?.open || "09:00"}
                      onChange={(e) => updateHours(day, "open", e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={form.operatingHours[day]?.close || "22:00"}
                      onChange={(e) => updateHours(day, "close", e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {submitting ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
}
