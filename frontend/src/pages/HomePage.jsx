import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import SideNav from "../components/SideNav";
import PostGrid from "../components/PostGrid";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts } from "../redux/actions/postAction";
import NotificationsTab from "../components/features/NotificationsTab";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PostPage from "./PostPage";
import axios from "../utils/axios";
import { RiHome2Fill } from "@remixicon/react";
import { fetchNotifications } from "../redux/actions/notificationAction";

function HomePage() {
  const [category, setCategory] = useState("all discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationTabActive, setIsNotificationTabActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfNewNotifications, setNumberOfNewNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [postArray, setPostArray] = useState([]);
  const { id } = useParams(); // Get the post ID from the URL if the route is "/post/:id"
  const reduxPosts = useSelector((state) => state.posts.posts);
  // Get notifications from Redux
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  const search = async (query, page = currentPage) => {
    if (loading) return; // Prevent new search if already loading

    setLoading(true); // Set loading to true when search starts
    setSearchQuery(query); // Update search query state
    const encodedQuery = encodeURIComponent(query);

    if (location.pathname !== "/") {
      navigate("/");
    }

    try {
      const response = await axios.get(
        `/posts/search?query=${encodedQuery}&page=${page}`
      );

      if (Array.isArray(response.data.posts)) {
        setPostArray((prevArray) =>
          page === 1
            ? response.data.posts
            : [...prevArray, ...response.data.posts]
        );
      }
    } catch (error) {
      console.log("Error while searching posts", error);
    } finally {
      setLoading(false); // Set loading to false when search completes
    }
  };

  const navBack = () => {
    setPostArray(reduxPosts);
  };

  useEffect(() => {
    setPostArray(reduxPosts); // Sync postArray with reduxPosts
  }, [reduxPosts]); // Depend only on reduxPosts

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Update the count of unread notifications whenever notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;
    setNumberOfNewNotifications(unreadCount);
  }, [notifications]);

  return (
    <div className="relative w-screen h-[100vh] overflow-hidden">
      <TopNav
        category={category}
        searchFunc={search}
        isNotificationTabActive={isNotificationTabActive}
        toggleNotificationTab={toggleNotificationTab}
        numberOfNewNotifications={numberOfNewNotifications}
      />

      <div className="flex relative z-10">
        <SideNav setCategory={setCategory} />
        <div className="h-[88vh] mt-[12vh] w-[75%] py-10 px-2 overflow-auto">
          {postArray != useSelector((state) => state.posts.posts) && !id && (
            <div className="flex items-end gap-4 ml-10 dark:text-[#EDEDED]">
              <RiHome2Fill
                onClick={() => navBack()}
                size={30}
                className="mt-5 ml-5 opacity-50 hover:opacity-100"
              />
              <h2 className="">{`Showing search result for "${searchQuery}":`}</h2>
            </div>
          )}
          {/* Conditionally render PostPage, PostGrid, or "Searching..." based on loading state and the URL */}
          {id ? (
            <PostPage /> // If there's a post ID in the URL, show PostPage
          ) : loading ? (
            "Searching..." // Show "Searching..." while loading
          ) : postArray ? (
            <PostGrid
              className="flex-grow"
              postsArray={postArray}
              category={category}
            />
          ) : (
            "loading"
          )}
        </div>
      </div>

      <NotificationsTab
        isNotificationTabActive={isNotificationTabActive}
        setIsNotificationTabActive={setIsNotificationTabActive}
        setNumberOfNewNotifications={setNumberOfNewNotifications}
      />
    </div>
  );
}

export default HomePage;
