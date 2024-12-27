import { RiSearchLine } from "@remixicon/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

function SearchBar({ searchFunc }) {
  const [query, setQuery] = useState("");
  const { theme } = useSelector((state) => state.theme);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleIconClick = () => {
    if (query) {
      searchFunc(query);
      setQuery(""); // Clear the input field after search
    }
  };

  return (
    <div className="flex bg-zinc-300 dark:bg-zinc-700 items-center justify-between w-full h-[2.25rem] rounded-[12px] bg-zinc-200 px-6 py-2">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        className="w-full bg-transparent focus:outline-none focus:ring-0"
      />
      <RiSearchLine
        onClick={handleIconClick}
        color={theme === "dark" ? "#EDEDED" : "#161616"}
        className={
          query ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"
        }
      />
    </div>
  );
}

export default SearchBar;
