// components/CharitySearch.jsx
"use client";
import { Search, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const DirectSearch = ({ onSearch, blurEnabled, onToggleBlur }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="relative grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="size-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full dark:text-black p-4 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            placeholder="Search charities by name, mission, location, tags..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => {
                setSearchQuery("");
                onSearch("");
              }}
            >
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">
                ✕
              </span>
            </button>
          )}
        </div>

        <button
          onClick={onToggleBlur}
          className={`flex items-center justify-center bg-primary gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300`}
        >
          {blurEnabled ? (
            <>
              <EyeOff className="size-5" />
              <span>Focus</span>
            </>
          ) : (
            <>
              <Eye className="size-5" />
              <span>Unfocus</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DirectSearch;
