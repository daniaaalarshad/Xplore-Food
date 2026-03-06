"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/layout";
import StarRating from "@/components/StarRating";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Heart,
  ArrowLeft,
  Leaf,
  Wheat,
  ChevronLeft,
  ChevronRight,
  Send,
  BadgeCheck,
} from "lucide-react";

interface RestaurantDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  cityName: string | null;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cuisineType: string;
  priceRange: number;
  dietaryOptions: string[] | null;
  operatingHours: Record<string, { open: string; close: string; closed?: boolean }> | null;
  isVerified: boolean | null;
  averageRating: string | null;
  totalReviews: number | null;
  photos: { id: number; url: string; caption: string | null; isPrimary: boolean | null }[];
  menu: {
    id: number;
    name: string;
    items: {
      id: number;
      name: string;
      description: string | null;
      price: string;
      isVegetarian: boolean | null;
      isVegan: boolean | null;
      isGlutenFree: boolean | null;
      isAvailable: boolean | null;
    }[];
  }[];
  reviews: {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  }[];
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "reviews" | "info">("menu");

  useEffect(() => {
    if (params.id) {
      fetch(`/api/restaurants/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setRestaurant(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      if (isAuthenticated) {
        fetch(`/api/favorites/check/${params.id}`, { credentials: "include" })
          .then((res) => res.json())
          .then((data) => setIsFavorited(data.favorited))
          .catch(() => {});
      }
    }
  }, [params.id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch(`/api/favorites/${params.id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (reviewRating === 0) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setRestaurant((prev) =>
          prev
            ? {
                ...prev,
                reviews: [
                  {
                    ...newReview,
                    firstName: user?.firstName || null,
                    lastName: user?.lastName || null,
                    profileImageUrl: user?.profileImageUrl || null,
                  },
                  ...prev.reviews,
                ],
              }
            : prev
        );
        setReviewRating(0);
        setReviewComment("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Restaurant not found
        </h2>
        <button
          onClick={() => router.push("/restaurants")}
          className="text-primary-400 font-medium hover:text-primary-500"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  const rating = parseFloat(restaurant.averageRating || "0");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {restaurant.photos.length > 0 ? (
            <div className="relative rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={restaurant.photos[activePhoto]?.url}
                alt={restaurant.name}
                className="w-full h-72 sm:h-96 object-cover"
              />
              {restaurant.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhoto(
                        (activePhoto - 1 + restaurant.photos.length) %
                          restaurant.photos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhoto(
                        (activePhoto + 1) % restaurant.photos.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {restaurant.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhoto(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === activePhoto ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-72 sm:h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <span className="text-primary-400 text-6xl font-bold">
                {restaurant.name[0]}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {restaurant.name}
                  </h1>
                  {restaurant.isVerified && (
                    <BadgeCheck className="h-6 w-6 text-secondary-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                    {restaurant.cuisineType}
                  </span>
                  <span>{"$".repeat(restaurant.priceRange)}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="font-medium text-gray-700">
                      {rating > 0 ? rating.toFixed(1) : "New"}
                    </span>
                    {restaurant.totalReviews && restaurant.totalReviews > 0 && (
                      <span>({restaurant.totalReviews} reviews)</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full border transition-colors ${
                  isFavorited
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {restaurant.description && (
              <p className="text-gray-600 leading-relaxed">
                {restaurant.description}
              </p>
            )}

            {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {restaurant.dietaryOptions.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-secondary-50 text-secondary-700 rounded-full"
                  >
                    <Leaf className="h-3 w-3" />
                    {opt}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex border-b border-gray-200">
            {(["menu", "reviews", "info"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-primary-400 text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "menu" && (
            <div className="space-y-6">
              {restaurant.menu.length > 0 ? (
                restaurant.menu.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                      {category.name}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start justify-between p-3 rounded-lg ${
                            item.isAvailable === false
                              ? "opacity-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {item.name}
                              </span>
                              {item.isVegetarian && (
                                <span className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm">
                                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                                </span>
                              )}
                              {item.isVegan && (
                                <Leaf className="h-4 w-4 text-green-600" />
                              )}
                              {item.isGlutenFree && (
                                <Wheat className="h-4 w-4 text-amber-600" />
                              )}
                              {item.isAvailable === false && (
                                <span className="text-xs text-red-500 font-medium">
                                  Unavailable
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900 ml-4">
                            ${parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Menu not available yet
                </p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {isAuthenticated && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Write a Review
                  </h3>
                  <div className="mb-3">
                    <StarRating
                      rating={reviewRating}
                      interactive
                      onRate={setReviewRating}
                      size="lg"
                    />
                  </div>
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm resize-none"
                    rows={3}
                  />
                  <button
                    onClick={submitReview}
                    disabled={reviewRating === 0 || submittingReview}
                    className="mt-3 bg-primary-400 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="text-gray-600 mb-3">
                    Sign in to leave a review
                  </p>
                  <a
                    href="/login"
                    className="inline-block bg-primary-400 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-500 transition-colors"
                  >
                    Sign In
                  </a>
                </div>
              )}

              {restaurant.reviews.length > 0 ? (
                restaurant.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3 mb-2">
                      {review.profileImageUrl ? (
                        <img
                          src={review.profileImageUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                          {(review.firstName?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.firstName || "Anonymous"}{" "}
                          {review.lastName?.[0] ? `${review.lastName[0]}.` : ""}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm ml-13">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">{restaurant.address}</p>
                  {restaurant.cityName && (
                    <p className="text-gray-500 text-sm">{restaurant.cityName}</p>
                  )}
                </div>
              </div>

              {restaurant.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-primary-400 hover:text-primary-500"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}

              {restaurant.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a
                      href={`mailto:${restaurant.email}`}
                      className="text-primary-400 hover:text-primary-500"
                    >
                      {restaurant.email}
                    </a>
                  </div>
                </div>
              )}

              {restaurant.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Website</p>
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-500"
                    >
                      {restaurant.website}
                    </a>
                  </div>
                </div>
              )}

              {restaurant.operatingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 mb-2">
                      Operating Hours
                    </p>
                    <div className="space-y-1">
                      {dayNames.map((day) => {
                        const hours =
                          restaurant.operatingHours?.[day.toLowerCase()];
                        return (
                          <div
                            key={day}
                            className="flex justify-between text-sm gap-8"
                          >
                            <span className="text-gray-600 w-24">{day}</span>
                            <span className="text-gray-900">
                              {hours?.closed
                                ? "Closed"
                                : hours
                                ? `${hours.open} - ${hours.close}`
                                : "Not set"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 line-clamp-2">
                    {restaurant.address}
                  </span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-primary-400"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <span className="text-gray-600">
                    {rating > 0 ? `${rating.toFixed(1)} rating` : "No ratings yet"}
                  </span>
                </div>
              </div>
            </div>

            {restaurant.photos.length > 1 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {restaurant.photos.slice(0, 6).map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setActivePhoto(i)}
                      className={`rounded-lg overflow-hidden border-2 transition-colors ${
                        activePhoto === i
                          ? "border-primary-400"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || ""}
                        className="w-full h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
