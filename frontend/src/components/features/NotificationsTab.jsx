import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchNotifications } from "../../redux/actions/notificationAction";
import { RiHeartFill } from "@remixicon/react";

function NotificationsTab({ isNotificationTabActive }) {
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  console.log(notifications);
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
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="rounded-xl w-[90%] h-[20%] bg-[#EDEDED] dark:bg-[#161616] mx-auto my-3 flex items-center px-5 py-2"
            >
              {notification.type === "like" ? (
                <></>
              ) : (
                <>
                  <div></div>
                </>
              )}
            </div>
          ))
        ) : (
          <h2 className="mx-auto mt-10 text-center">
            You don't have any notifications at the moment.
          </h2>
        )}
      </motion.div>
    </div>
  );
}

export default NotificationsTab;
