import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import SearchBar from "./partials/SearchBar";
import {
  RiArrowDownSLine,
  RiMenuFill,
  RiNotificationFill,
  RiNotificationLine,
} from "@remixicon/react";
import UserMenu from "./partials/UserMenu";
import Skeleton from "react-loading-skeleton";

function TopNav({
  category,
  searchFunc,
  isNotificationTabActive,
  toggleNotificationTab,
  numberOfNewNotifications,
  toggleSideNav,
}) {
  const [hoveredOverUser, setHoveredOverUser] = useState(false);
  const isMediumScreen = window.innerWidth < 1024;

  const { user } = useSelector((state) => state.user);
  return (
    <div
      className={`h-[12vh] ${
        isMediumScreen ? "w-[100%]" : "w-[75%] right-0 absolute z-[9999]"
      }  flex items-center justify-between px-10 bg-[#EDEDED] dark:bg-[#161616] text-[#161616] dark:text-[#EDEDED] shadow-lg shadow-bottom`}
    >
      <div className="flex items-center gap-5">
        {isMediumScreen ? (
          <RiMenuFill
            onClick={() => {
              toggleSideNav();
            }}
            className="text-[#161616] dark:text-[#EDEDED]"
          />
        ) : null}

        <div className="text-2xl capitalize hidden sm:block">{category}</div>
      </div>
      <div className="flex gap-2 sm:gap-7 items-center">
        <div id="search-div" className="ml-5 sm:ml-0">
          <SearchBar searchFunc={searchFunc} />
        </div>
        {user ? (
          <div id="nav-btns" className="flex items-center">
            <div
              className="flex items-center gap-2 group"
              onMouseEnter={() => {
                setHoveredOverUser(true);
              }}
              onMouseLeave={() => {
                setHoveredOverUser(false);
              }}
            >
              <div
                style={{
                  backgroundImage: `url("/media/profileIcon.jpg")`,
                }}
                className="w-10 h-10 rounded-full bg-cover bg-center overflow-hidden"
              >
                <img
                  src={user.profilePictureSrc}
                  className="w-10 h-10 rounded-full object-cover object-top"
                />
              </div>
              <div id="profile-name" className="flex items-center gap-1">
                <div className="text-[1.1rem] hidden sm:block">
                  {user ? user.username : "Guest"}
                </div>
                <RiArrowDownSLine className="group-hover:translate-y-[20%] transition-all duration-[0.3s] ease-in-out" />
              </div>
            </div>

            <div
              className="flex items-center ml-3 relative"
              onClick={toggleNotificationTab}
            >
              {numberOfNewNotifications > 0 && (
                <div className="absolute right-1 top-1 translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-[#ea516f] text-xs text-[#EDEDED] dark:text-[#161616] outline outline-[2px]">
                  {numberOfNewNotifications}
                </div>
              )}

              {isNotificationTabActive ? (
                <RiNotificationFill size={25} />
              ) : (
                <RiNotificationLine size={25} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Skeleton circle={true} height={45} width={45} />
            <Skeleton width={"9vw"} height={25} />
          </div>
        )}
      </div>
      <motion.div
        id="user-menu"
        className="absolute z-[99999] right-[20%] sm:right-[10%] md:right-[9.3%] lg:right-[8%] top-[10.5%] lg:top-[90%]"
        initial={{ opacity: 0, y: -20 }}
        animate={
          hoveredOverUser
            ? { opacity: 1, y: 0, display: "block" }
            : { opacity: 0, y: -20, display: "none" }
        }
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setHoveredOverUser(true)}
        onMouseLeave={() => setHoveredOverUser(false)}
      >
        <UserMenu />
      </motion.div>
    </div>
  );
}

export default TopNav;
