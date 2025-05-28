import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch, ...props }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      <input
        type="search"
        className="block w-full rounded-xl border border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white pl-10 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition-all duration-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-md hover:border-indigo-300"
        placeholder="Search passwords and notes..."
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
