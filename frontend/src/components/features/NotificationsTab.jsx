import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
} from "../../redux/actions/notificationAction";
import { Link } from "react-router-dom";

function NotificationsTab({
  isNotificationTabActive,
  setIsNotificationTabActive,
  setNumberOfNewNotifications,
}) {
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const dispatch = useDispatch();
  const [wasTabOpened, setWasTabOpened] = useState(false); // Track if the tab was opened

  // Fetch notifications when the notification tab is opened
  useEffect(() => {
    if (isNotificationTabActive) {
      setWasTabOpened(true); // Mark that the tab was opened
      dispatch(fetchNotifications());
    } else if (wasTabOpened) {
      // Only mark notifications as read if the tab was opened at least once
      dispatch(markAsRead());
    }
  }, [isNotificationTabActive, dispatch, wasTabOpened]);

  // Separate unread and read notifications
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  );
  const readNotifications = notifications.filter(
    (notification) => notification.isRead
  );

  useEffect(() => {
    setNumberOfNewNotifications(unreadNotifications.length);
  }, [unreadNotifications, setNumberOfNewNotifications]);

  return (
    <div>
      <motion.div
        style={{
          backdropFilter: "blur(18px)",
          background: "rgba(0,0,0,0.2)",
        }}
        className="w-[32%] h-screen bg-blue-200 right-0 top-[12vh] absolute z-20 shadow-xl shadow-left overflow-y-scroll"
        initial={{ x: "100%" }}
        animate={{ x: isNotificationTabActive ? "0%" : "100%" }}
        transition={{ type: "tween", stiffness: 300 }}
      >
        {notifications.length > 0 ? (
          <>
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mx-5 mt-5">
                  Unread Notifications
                </h2>
                {unreadNotifications.map((notification, index) => (
                  <Link
                    to={`/post/${notification.post}#${
                      notification.type === "comment" ||
                      notification.type === "reply"
                        ? `comment-${notification.comment}`
                        : ""
                    }`}
                    onClick={() => setIsNotificationTabActive(false)}
                    key={index}
                    className="rounded-xl w-[90%] h-[20%] bg-[#EDEDED] dark:bg-[#161616] hover:bg-zinc-200 dark:hover:bg-zinc-900 mx-auto my-3 flex gap-5 px-5 py-5"
                  >
                    {notification.type === "reply" ? null : (
                      <>
                        <div id="post-preview">
                          {notification.postImage[0]?.type === "image" ? (
                            <img
                              className="max-w-[5rem] rounded-md h-auto fit-cover"
                              src={notification.postImage[0]?.url}
                              alt="Preview"
                            />
                          ) : (
                            <video src={notification.postImage[0]?.url} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-[#161616] dark:text-[#EDEDED]">
                            {notification.message}
                          </h3>
                        </div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            {unreadNotifications.length > 0 && readNotifications.length > 0 && (
              <hr className="my-4 border-t-2 border-gray-300" />
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mx-5 mt-5">
                  Read Notifications
                </h2>
                {readNotifications.map((notification, index) => (
                  <Link
                    to={`/post/${notification.post}#${
                      notification.type === "comment" ||
                      notification.type === "reply"
                        ? `comment-${notification.comment}`
                        : ""
                    }`}
                    onClick={() => setIsNotificationTabActive(false)}
                    key={index}
                    className="rounded-xl w-[90%] h-[20%] bg-[#EDEDED] dark:bg-[#161616] hover:bg-zinc-200 dark:hover:bg-zinc-900 mx-auto my-3 flex gap-5 px-5 py-5"
                  >
                    {notification.type === "reply" ? null : (
                      <>
                        <div id="post-preview">
                          {notification.postImage[0]?.type === "image" ? (
                            <img
                              className="max-w-[5rem] rounded-md h-auto fit-cover"
                              src={notification.postImage[0]?.url}
                              alt="Preview"
                            />
                          ) : (
                            <video src={notification.postImage[0]?.url} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-[#161616] dark:text-[#EDEDED]">
                            {notification.message}
                          </h3>
                        </div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
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
