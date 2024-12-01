import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../redux/actions/userAction"; // Import fetchUser action creator
import SearchBar from "./partials/SearchBar";
import {
  RiArrowDownSLine,
  RiNotificationFill,
  RiNotificationLine,
} from "@remixicon/react";

function TopNav({ isNotificationTabActive, toggleNotificationTab }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const { user } = useSelector((state) => state.user);
  return (
    <div className="h-[12vh] w-screen flex items-center justify-between px-10 shadow-lg shadow-down bg-white">
      <div id="logo-div" className="text-2xl">
        Cloak
        <br />
        Campus
      </div>
      <div id="search-div">
        <SearchBar />
      </div>
      <div id="nav-btns" className="flex items-center gap-2">
        <div className="bg-yellow-300 w-10 h-10 rounded-full hover:border-[2px] hover:border-black transition-all duration-[0.3s] ease-in-out"></div>
        <div id="profile-name" className="flex items-center gap-1 group">
          <div className="text-lg">{user ? user.username : "Guest"}</div>
          <RiArrowDownSLine className="group-hover:translate-y-[20%] transition-all duration-[0.3s] ease-in-out" />
        </div>

        <div className="flex items-center ml-5" onClick={toggleNotificationTab}>
          {isNotificationTabActive ? (
            <RiNotificationFill size={29} />
          ) : (
            <RiNotificationLine size={29} />
          )}
        </div>
      </div>
    </div>
  );
}

export default TopNav;
