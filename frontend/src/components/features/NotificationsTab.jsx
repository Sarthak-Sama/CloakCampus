import React from "react";
import { motion } from "framer-motion";

function NotificationsTab({ isNotificationTabActive }) {
  return (
    <div>
      <motion.div
        style={{
          backdropFilter: "blur(18px)",
          background: "rgba(0,0,0,0.2)",
        }}
        className="w-[32%] h-screen bg-blue-200 right-0 top-[12vh] absolute z-20 shadow-xl shadow-left"
        initial={{ x: "100%" }}
        animate={{ x: isNotificationTabActive ? "0%" : "100%" }}
        transition={{ type: "tween", stiffness: 300 }}
      />
    </div>
  );
}

export default NotificationsTab;
