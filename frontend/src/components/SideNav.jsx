import { RiAddLine } from "@remixicon/react";
import React from "react";
import { Link } from "react-router-dom";
import ToggleButton from "./partials/ToggleButton";
import { useSelector } from "react-redux";

function SideNav({ setCategory }) {
  const { user } = useSelector((state) => state.user);
  const categoriesArray = user?.categories;
  console.log(categoriesArray);

  return (
    <div className="w-[25%] h-screen flex flex-col items-center text-center pl-5 pr-12 pt-8 small-border">
      <h1 className="text-left text-4xl font-['shrimp] leading-[2rem] mb-10">
        Cloak
        <br />
        Campus
      </h1>
      <Link
        to={"/upload"}
        className="flex gap-2 items-center bg-[#EA516F] text-[#EDEDED] px-10 py-3 rounded-full group"
      >
        <h3 className="uppercase text-lg">Post</h3>
        <RiAddLine className="group-hover:rotate-[90deg] transition-all duration-[0.3s] ease-in-out" />
      </Link>
      <Link
        onClick={() => {
          setCategory("all discussion");
        }}
        className="text-lg mt-10"
      >
        All Discussion
      </Link>
      <hr className="border-zinc-600 rounded-full w-[80%] mb-6 mt-3" />
      <div className="w-full flex flex-col items-center h-[55%]">
        {user
          ? categoriesArray.map((cat, index) => (
              <>
                <Link
                  onClick={() => {
                    setCategory(cat);
                  }}
                  key={index}
                  className="text-[1.1rem] my-2"
                >
                  {cat}
                </Link>
                <hr className="w-[80%] rounded-full border-zinc-600" />
              </>
            ))
          : "loading"}
      </div>
      <div className="flex items-center">
        <span>Color Mode:</span>
        <ToggleButton />
      </div>
    </div>
  );
}

export default SideNav;
