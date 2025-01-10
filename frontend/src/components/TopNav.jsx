import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchUser } from "../redux/actions/userAction"; // Import fetchUser action creator
import SearchBar from "./partials/SearchBar";
import {
  RiArrowDownSLine,
  RiMenuFill,
  RiNotificationFill,
  RiNotificationLine,
} from "@remixicon/react";
import UserMenu from "./partials/UserMenu";

function TopNav({
  category,
  searchFunc,
  isNotificationTabActive,
  toggleNotificationTab,
  numberOfNewNotifications,
  toggleSideNav,
}) {
  const dispatch = useDispatch();
  const [hoveredOverUser, setHoveredOverUser] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("latest");

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const { user } = useSelector((state) => state.user);

  const handleSort = (sortOption) => {
    // Implement sorting logic based on sortOption
    setSortOption(sortOption);
    setDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div
      className={`h-[12vh] ${
        window.innerWidth < 1024 ? "w-[75%]" : "w-[100%]"
      } right-0 absolute z-[9999] flex items-center justify-between px-10 bg-[#EDEDED] dark:bg-[#161616] text-[#161616] dark:text-[#EDEDED] shadow-lg shadow-bottom`}
    >
      <div className="flex items-center gap-5">
        {window.innerWidth < 1024 ? null : (
          <RiMenuFill
            onClick={() => {
              toggleSideNav();
            }}
            className="text-[#161616] dark:text-[#EDEDED]"
          />
        )}

        <div className="text-2xl capitalize">{category}</div>
      </div>
      <div className="flex gap-7 items-center">
        <div id="search-div">
          <SearchBar searchFunc={searchFunc} />
        </div>
        {user ? (
          <div id="nav-btns" className="flex items-center gap-2">
            <div
              style={{
                backgroundImage: `url(${user.profilePictureSrc})`,
                backgroundSize: "cover",
                backgroundPosition: "top",
                backgroundRepeat: "no-repeat",
              }}
              className="bg-yellow-300 w-10 h-10 rounded-full transition-all duration-[0.3s] ease-in-out"
              onMouseEnter={(e) =>
                (e.target.style.outline = "2.5px solid #EA516F")
              }
              onMouseLeave={(e) => (e.target.style.outline = "none")}
            ></div>
            <div
              onMouseEnter={() => {
                setHoveredOverUser(true);
              }}
              onMouseLeave={() => {
                setHoveredOverUser(false);
              }}
              id="profile-name"
              className="flex items-center gap-1 group"
            >
              <div className="text-[1.1rem]">
                {user ? user.username : "Guest"}
              </div>
              <RiArrowDownSLine className="group-hover:translate-y-[20%] transition-all duration-[0.3s] ease-in-out" />
            </div>

            <div
              className="flex items-center ml-3 relative"
              onClick={toggleNotificationTab}
            >
              {numberOfNewNotifications > 0 && (
                <div className="absolute right-1 top-1 translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-[#ea516f] text-xs text-[#EDEDED] dark:text-[#161616]">
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
          "loading"
        )}
      </div>
      <motion.div
        id="user-menu"
        className="absolute right-[8%] top-[90%]"
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
