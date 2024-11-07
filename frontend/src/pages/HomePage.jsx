import React, { useState } from "react";
import TopNav from "../components/TopNav";
import { motion } from "framer-motion";
import SideNav from "../components/SideNav";
import PostGrid from "../components/PostGrid";

function HomePage() {
  const [isNotificationTabActive, setIsNotificationTabActive] = useState(false);

  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  return (
    <div className="relative w-full h-[100vh] overflow-hidden">
      <TopNav
        isNotificationTabActive={isNotificationTabActive}
        toggleNotificationTab={toggleNotificationTab}
      />

      <div className="flex relative z-10">
        <SideNav />
        <PostGrid className="flex-grow" />
      </div>

      <motion.div
        className="w-[32%] h-screen bg-blue-200 right-0 top-[12vh] absolute z-20 shadow-xl shadow-left"
        initial={{ x: "100%" }}
        animate={{ x: isNotificationTabActive ? "0%" : "100%" }}
        transition={{ type: "tween", stiffness: 300 }}
      />
    </div>
  );
}

export default HomePage;
