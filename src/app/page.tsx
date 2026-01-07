"use client";
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Star,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const CustardApp = () => {
  // 🔧 CONFIGURE YOUR API URL HERE
  // Replace with your Railway or Render URL after deployment
  const API_URL = "http://localhost:4000/api";

const [custardStands, setCustardStands] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [favorites, setFavorites] = useState(["Kopp's - Greenfield"]);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch data from API
  const fetchFlavors = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`${API_URL}/flavors`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // Transform API data to match our app format
      const transformedStands = data.stands.map((stand : any) => {
        // Get today's flavor
        const todayFlavor =
          stand.flavors.find((f : any) => f.dayLabel === "today") || stand.flavors[0];
        const tomorrowFlavor = stand.flavors.find(
          (f : any) => f.dayLabel === "tomorrow"
        );

        // Format flavors
        const todayFlavorText =
          todayFlavor?.flavors?.[0]?.name || "Check in-store";
        const todayDescription = todayFlavor?.flavors?.[0]?.description || "";
        const tomorrowFlavorText =
          tomorrowFlavor?.flavors?.[0]?.name || "Check website";

        return {
          id: stand.id,
          name: stand.name,
          location: stand.location,
          address: stand.address,
          distance: "-- mi", // Could calculate from user location
          status:
            stand.status === "open"
              ? "Open"
              : stand.status === "closed"
              ? "Closed"
              : "Unknown",
          hours: stand.hours,
          todaysFlavor: todayFlavorText,
          flavorDescription: todayDescription,
          tomorrowsFlavor: tomorrowFlavorText,
          website: stand.website,
          hasCalendar:
            stand.website?.includes("kopps") ||
            stand.website?.includes("murfs") ||
            stand.website?.includes("culvers"),
          allFlavors: stand.flavors,
        };
      });

      setCustardStands(transformedStands);
      setLastUpdated(data.lastUpdated || new Date().toLocaleString());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch flavors:", err);
      setError(err.message as any);

      // If first load fails, show sample data
      if (!showRefreshSpinner) {
        setCustardStands([
          {
            id: "error",
            name: "Unable to load data",
            location: "Please try again",
            address: "Check your connection",
            distance: "-- mi",
            status: "Unknown",
            hours: "N/A",
            todaysFlavor: "Unable to fetch",
            flavorDescription: "The API might not be running or is unreachable",
            tomorrowsFlavor: "N/A",
            website: null,
            hasCalendar: false,
          },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFlavors();
  }, []);

  const toggleFavorite = (name : any) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const getStatusColor = (status : any) => {
    if (status.includes("Open")) return "text-green-600 bg-green-50";
    if (status.includes("Closed")) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const handleRefresh = () => {
    fetchFlavors(true);
  };

  const openWebsite = (url : any) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-lg font-semibold text-purple-900">
            Loading custard flavors...
          </p>
          <p className="text-sm text-gray-600 mt-2">Fetching data from API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🍦 MKE Custard</h1>
            <p className="text-blue-100 text-sm">
              Today's flavors across Milwaukee
            </p>
            {lastUpdated && (
              <p className="text-blue-200 text-xs mt-1">
                Updated: {lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              Make sure your API is running at:{" "}
              <code className="bg-red-100 px-1 rounded">{API_URL}</code>
            </p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">
            {custardStands.filter((s) => s.status === "Open").length}
          </div>
          <div className="text-xs text-gray-600">Open Now</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-2xl font-bold text-purple-600">
            {custardStands.length}
          </div>
          <div className="text-xs text-gray-600">Total Stands</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-2xl font-bold text-pink-600">
            {favorites.length}
          </div>
          <div className="text-xs text-gray-600">Favorites</div>
        </div>
      </div>

      {/* Custard Stand List */}
      <div className="p-4 space-y-3 pb-8">
        {custardStands.map((stand) => {
          const isFavorite = favorites.includes(
            `${stand.name} - ${stand.location}`
          );

          return (
            <div
              key={stand.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Stand Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {stand.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {stand.location} • {stand.distance}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      toggleFavorite(`${stand.name} - ${stand.location}`)
                    }
                    className="ml-2"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                      stand.status
                    )}`}
                  >
                    {stand.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {stand.hours}
                  </span>
                </div>
              </div>

              {/* Today's Flavor */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
                    Today's Flavor
                  </span>
                </div>
                <h4 className="text-xl font-bold text-purple-900 mb-1">
                  {stand.todaysFlavor}
                </h4>
                <p className="text-sm text-gray-700">
                  {stand.flavorDescription}
                </p>
              </div>

              {/* Tomorrow's Preview */}
              {stand.tomorrowsFlavor && stand.tomorrowsFlavor !== "N/A" && (
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Tomorrow:</span>
                    <span>{stand.tomorrowsFlavor}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 flex gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        stand.address
                      )}`,
                      "_blank"
                    )
                  }
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Directions
                </button>
                {stand.hasCalendar && stand.website && (
                  <button
                    onClick={() => openWebsite(stand.website)}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Calendar
                  </button>
                )}
                {stand.website && (
                  <button
                    onClick={() => openWebsite(stand.website)}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="p-4 pb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 text-center">
          <p className="text-sm mb-2">💡 Pro Tip</p>
          <p className="text-xs opacity-90">
            Star your favorite stands to track them! Data updates automatically
            every day at 6 AM.
          </p>
          <p className="text-xs opacity-75 mt-2">
            API Status: {error ? "🔴 Offline" : "🟢 Connected"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustardApp;
