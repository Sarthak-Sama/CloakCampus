import { RiSearchLine } from "@remixicon/react";
import React, { useState } from "react";

function SearchBar() {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  return (
    <div className="flex items-center justify-between w-[100%] h-[2.25rem] rounded-full bg-zinc-200 px-6 py-2">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        className="w-full bg-transparent focus:outline-none focus:ring-0"
      />
      <RiSearchLine
        className={`text-zinc-400 ${query ? "text-zinc-900" : ""}`}
      />
    </div>
  );
}

export default SearchBar;
