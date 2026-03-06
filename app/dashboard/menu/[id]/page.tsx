"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/layout";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Leaf,
} from "lucide-react";

interface MenuCategory {
  id: number;
  name: string;
  sortOrder: number | null;
  items: MenuItem[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  isVegetarian: boolean | null;
  isVegan: boolean | null;
  isGlutenFree: boolean | null;
  isAvailable: boolean | null;
}

export default function MenuManagerPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const [newItem, setNewItem] = useState({
    categoryId: 0,
    name: "",
    description: "",
    price: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  });
  const [showAddItem, setShowAddItem] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (params.id && isAuthenticated) {
      Promise.all([
        fetch(`/api/restaurants/${params.id}`).then((r) => r.json()),
        fetch(`/api/dashboard/restaurants/${params.id}/menu`, {
          credentials: "include",
        }).then((r) => r.json()),
      ])
        .then(([restaurant, menu]) => {
          setRestaurantName(restaurant.name);
          setCategories(Array.isArray(menu) ? menu : []);
          const allIds = new Set(
            (Array.isArray(menu) ? menu : []).map((c: MenuCategory) => c.id)
          );
          setExpandedCategories(allIds);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id, isAuthenticated]);

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(
        `/api/dashboard/restaurants/${params.id}/menu-categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: newCategoryName,
            sortOrder: categories.length,
          }),
        }
      );
      if (res.ok) {
        const category = await res.json();
        setCategories((prev) => [...prev, { ...category, items: [] }]);
        setExpandedCategories((prev) => new Set([...prev, category.id]));
        setNewCategoryName("");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm("Delete this category and all its items?")) return;
    try {
      const res = await fetch(`/api/dashboard/menu-categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const addItem = async (categoryId: number) => {
    if (!newItem.name.trim() || !newItem.price) return;
    try {
      const res = await fetch(
        `/api/dashboard/restaurants/${params.id}/menu-items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...newItem, categoryId }),
        }
      );
      if (res.ok) {
        const item = await res.json();
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId ? { ...c, items: [...c.items, item] } : c
          )
        );
        setNewItem({
          categoryId: 0,
          name: "",
          description: "",
          price: "",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
        });
        setShowAddItem(null);
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const deleteItem = async (categoryId: number, itemId: number) => {
    try {
      const res = await fetch(`/api/dashboard/menu-items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Manage Menu
      </h1>
      <p className="text-gray-500 mb-8">{restaurantName}</p>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category name (e.g., Appetizers, Main Course)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm"
          />
          <button
            onClick={addCategory}
            className="bg-primary-400 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedCategories.has(category.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                  <h3 className="font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <span className="text-sm text-gray-400">
                    ({category.items.length} items)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(category.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {expandedCategories.has(category.id) && (
                <div className="border-t px-4 pb-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </span>
                          {item.isVegetarian && (
                            <span className="w-3 h-3 border border-green-600 flex items-center justify-center rounded-sm">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                            </span>
                          )}
                          {item.isVegan && (
                            <Leaf className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => deleteItem(category.id, item.id)}
                          className="p-1 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {showAddItem === category.id ? (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({ ...newItem, description: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({ ...newItem, price: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                      />
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={newItem.isVegetarian}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                isVegetarian: e.target.checked,
                              })
                            }
                          />
                          Vegetarian
                        </label>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={newItem.isVegan}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                isVegan: e.target.checked,
                              })
                            }
                          />
                          Vegan
                        </label>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={newItem.isGlutenFree}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                isGlutenFree: e.target.checked,
                              })
                            }
                          />
                          Gluten-Free
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddItem(null)}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => addItem(category.id)}
                          className="px-4 py-2 bg-primary-400 text-white text-sm rounded-lg hover:bg-primary-500 flex items-center gap-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Add Item
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddItem(category.id)}
                      className="mt-3 text-sm text-primary-400 hover:text-primary-500 flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">
            No menu categories yet. Start by adding a category above.
          </p>
        </div>
      )}
    </div>
  );
}
