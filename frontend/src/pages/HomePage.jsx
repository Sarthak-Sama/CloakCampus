import React, { useCallback, useEffect, useState, useRef } from "react";
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
import { motion } from "framer-motion";
import { throttle } from "lodash";

function HomePage() {
  const [category, setCategory] = useState("all discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationTabActive, setIsNotificationTabActive] = useState(false);
  const [isSideNavActive, setIsSideNavActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [numberOfNewNotifications, setNumberOfNewNotifications] = useState(0);
  const [isLinkCopiedNotificationVisible, setIsLinkCopiedNotificationVisible] =
    useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [postArray, setPostArray] = useState([]);
  const [popupText, setPopupText] = useState("");
  const postGridRef = useRef(null);
  const { id } = useParams(); // Get the post ID from the URL if the route is "/post/:id"
  const reduxPosts = useSelector((state) => state.posts.posts);
  // Get notifications from Redux
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  // Function to handle screen resizing
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      setIsSideNavActive(false); // Hide side nav for small/medium screens
    } else {
      setIsSideNavActive(true); // Show side nav for larger screens
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    // Initial check when component mounts
    handleResize();

    // Add event listener to track window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSideNav = () => setIsSideNavActive((prevState) => !prevState);

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
  const handleScroll = useCallback(
    throttle(() => {
      if (!loading && hasMore) {
        const { scrollTop, clientHeight, scrollHeight } = postGridRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
          const currentScrollPos = scrollTop;
          setCurrentPage((prevPage) => prevPage + 1);
          // Immediately restore scroll position
          requestAnimationFrame(() => {
            if (postGridRef.current) {
              postGridRef.current.scrollTop = currentScrollPos;
            }
          });
        }
      }
    }, 300),
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (currentPage === 1) {
        const response = await dispatch(fetchPosts(currentPage));
        if (response) {
          setHasMore(response.hasMore);
          setPostArray(response.posts);
          setLoading(false);
        }
      } else {
        // For subsequent pages, preserve scroll position
        const scrollPosition = postGridRef.current?.scrollTop;
        const response = await dispatch(fetchPosts(currentPage));
        if (response) {
          setHasMore(response.hasMore);
          setPostArray((prev) => [...prev, ...response.posts]);
          setLoading(false);

          // Use multiple frames to ensure scroll position is maintained
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (postGridRef.current) {
                postGridRef.current.scrollTop = scrollPosition;
              }
            });
          });
        }
      }
    };

    fetchData();
  }, [dispatch, currentPage]);

  useEffect(() => {
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
        toggleSideNav={toggleSideNav}
      />

      <div className="flex relative z-10">
        <motion.div
          className={`sm:w-[30vw] absolute z-[99999] w-[80%] lg:w-[25%] lg:relative`}
          initial={{ x: "0%" }}
          animate={{ x: isSideNavActive ? "0%" : "-100%" }}
          exit={{ x: "-50%" }}
          transition={{}}
        >
          <SideNav setCategory={setCategory} />
        </motion.div>
        <div
          className={`h-[88vh] mt-[0] lg:mt-[12vh] w-[100%] lg:w-[75%] py-10 px-2 overflow-auto`}
          ref={postGridRef}
          onScroll={handleScroll}
        >
          {postArray != useSelector((state) => state.posts.posts) &&
            searchQuery &&
            !id && (
              <div className="flex items-end gap-4 ml-10 dark:text-[#EDEDED]">
                <RiHome2Fill
                  onClick={() => navBack()}
                  size={30}
                  className="mt-5 ml-5 opacity-50 hover:opacity-100"
                />
                <h2 className="">{`Showing search result for "${searchQuery}":`}</h2>
              </div>
            )}
          {id ? (
            <PostPage />
          ) : loading ? (
            "Searching..."
          ) : postArray ? (
            <PostGrid
              className="flex-grow"
              postsArray={postArray}
              category={category}
              setIsLinkCopiedNotificationVisible={
                setIsLinkCopiedNotificationVisible
              }
              setPopupText={setPopupText}
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
      <h4
        className={`z-50 px-12 py-3 text-center text-xs sm:text-lg fixed left-1/2 lg:left-[60%] top-[87%] -translate-x-1/2 -translate-y-1/2 -t px-5 py-2 bg-[rgba(0,0,0,0.8)] text-white rounded-lg pointer-events-none transition duration-300 ease-in-out ${
          isLinkCopiedNotificationVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {popupText}
      </h4>
    </div>
  );
}

export default HomePage;
