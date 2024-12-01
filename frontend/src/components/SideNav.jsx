import { RiAddLine } from "@remixicon/react";
import React from "react";
import { Link } from "react-router-dom";

function SideNav() {
  return (
    <div className="w-[25%] h-full flex flex-col items-center text-center pl-6 pt-16">
      <Link
        to={"/upload"}
        className="flex gap-2 items-center bg-blue-600 px-10 py-3 rounded-full group"
      >
        <h3 className="uppercase text-lg">Post</h3>
        <RiAddLine className="group-hover:rotate-[90deg] transition-all duration-[0.3s] ease-in-out" />
      </Link>
      <Link className="text-lg mt-10">All Discussion</Link>
      <hr className="border-zinc-600 rounded-full w-[80%] mb-6 mt-3" />
    </div>
  );
}

export default SideNav;
