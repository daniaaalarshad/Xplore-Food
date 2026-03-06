import Link from "next/link";
import { UtensilsCrossed, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-7 w-7 text-primary-400" />
              <span className="text-xl font-bold text-white">
                Xplore <span className="text-primary-400">Food</span>
              </span>
            </div>
            <p className="text-gray-400 max-w-md">
              Discover the best food places in your city. Browse menus, read
              reviews, and find your next favorite restaurant.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  For Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">Contact Us</span>
              </li>
              <li>
                <span className="text-gray-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gray-400">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Xplore Food. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
