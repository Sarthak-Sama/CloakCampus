import { RiAddLine } from "@remixicon/react";
import React from "react";
import { Link } from "react-router-dom";
import ToggleButton from "./partials/ToggleButton";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import InstallPWAButton from "./partials/InstallPWAButton";

function SideNav({
  setCategory,
  isUploadingPost,
  setPopupText,
  deferredPrompt,
  isInstalled,
  setIsInstalled,
}) {
  const { user } = useSelector((state) => state.user);
  const categoriesArray = user?.categories;
  const { theme } = useSelector((state) => state.theme);
  return (
    <div
      className={`w-[100%] h-[88vh] lg:h-screen bg-[#EDEDED] dark:bg-[#161616] text-[#161616] dark:text-[#EDEDED] flex flex-col items-center text-center pl-5 pr-12 pt-8 ${
        window.innerWidth < 1024
          ? "border-zinc-600 border-r-[1px]"
          : theme === "dark"
          ? "small-border-dark"
          : "small-border-light"
      } `}
    >
      <Link
        to={"/"}
        className="text-left text-4xl font-['shrimp] leading-[2rem] mb-10"
      >
        Cloak
        <br />
        Campus
      </Link>
      <Link
        to={!isUploadingPost && "/upload"}
        onClick={() => {
          if (isUploadingPost)
            setPopupText("Please let the last upload finish first.");
        }}
        className="flex gap-2 items-center bg-[#EA516F] text-[#161616] dark:text-[#EDEDED] px-10 py-3 rounded-full group"
      >
        <h3 className="uppercase text-lg">Post</h3>
        <RiAddLine className="group-hover:rotate-[90deg] transition-all duration-[0.3s] ease-in-out" />
      </Link>
      <Link
        onClick={() => {
          setCategory("all discussion");
        }}
        className="text-lg mt-10 w-[80%] py-2 rounded-lg active:bg-zinc-300 sm:hover:bg-zinc-300 dark:acitve:bg-zinc-800 dark:hover:bg-zinc-800 transition duration-300"
      >
        All Discussion
      </Link>

      <hr className="border-zinc-600 rounded-full w-[80%] mb-6 mt-3" />
      <div className="w-full flex flex-col items-center h-[55%]">
        {user ? (
          categoriesArray.map((cat, index) => (
            <>
              <Link
                onClick={() => {
                  setCategory(cat);
                }}
                key={index}
                className="text-[1.1rem] my-1 w-[80%] py-2 rounded-lg active:bg-zinc-300 sm:hover:bg-zinc-300 dark:acitve:bg-zinc-800 dark:hover:bg-zinc-800 transition duration-300"
              >
                {cat}
              </Link>
              <hr className="w-[80%] rounded-full border-zinc-600" />
            </>
          ))
        ) : (
          <div className="w-full flex flex-col items-center h-[55%]">
            <div className="w-[80%]">
              <Skeleton width={"100%"} height={40} />
            </div>
            <hr className="w-[80%] my-2  rounded-full border-zinc-600" />
            <div className="w-[80%]">
              <Skeleton width={"100%"} height={40} />
            </div>
            <hr className="w-[80%] my-2  rounded-full border-zinc-600" />
            <div className="w-[80%]">
              <Skeleton width={"100%"} height={40} />
            </div>
            <hr className="w-[80%] my-2  rounded-full border-zinc-600" />
            <div className="w-[80%]">
              <Skeleton width={"100%"} height={40} />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center">
        <span>Color Mode:</span>
        <ToggleButton />
      </div>
      <div className="">
        <InstallPWAButton
          deferredPrompt={deferredPrompt}
          isInstalled={isInstalled}
          setIsInstalled={setIsInstalled}
        />
      </div>
    </div>
  );
}

export default SideNav;
