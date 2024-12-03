import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fetchUser } from "../redux/actions/userAction"; // Import fetchUser action creator
import SearchBar from "./partials/SearchBar";
import {
  RiArrowDownSLine,
  RiNotificationFill,
  RiNotificationLine,
} from "@remixicon/react";
import UserMenu from "./partials/UserMenu";

function TopNav({ category, isNotificationTabActive, toggleNotificationTab }) {
  const dispatch = useDispatch();
  const [hoveredOverUser, setHoveredOverUser] = useState(false);
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const { user } = useSelector((state) => state.user);
  return (
    <div className="h-[12vh] w-[75%] right-0 absolute z-[9999] flex items-center justify-between px-10 bg-[#161616] text-[#EDEDED] shadow-lg shadow-bottom">
      <div>
        <div id="logo-div" className="text-2xl capitalize">
          {category}
        </div>
      </div>
      <div className="flex gap-7 items-center">
        <div id="search-div">
          <SearchBar />
        </div>
        <div id="nav-btns" className="flex items-center gap-2">
          <div className="bg-yellow-300 w-10 h-10 rounded-full hover:border-[2px] hover:border-black transition-all duration-[0.3s] ease-in-out"></div>
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
            className="flex items-center ml-3"
            onClick={toggleNotificationTab}
          >
            {isNotificationTabActive ? (
              <RiNotificationFill size={25} />
            ) : (
              <RiNotificationLine size={25} />
            )}
          </div>
        </div>
      </div>
      <motion.div
        id="user-menu"
        className="absolute right-[8%] top-[90%]"
        initial={{ opacity: 0, y: -20 }}
        animate={
          hoveredOverUser ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
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
