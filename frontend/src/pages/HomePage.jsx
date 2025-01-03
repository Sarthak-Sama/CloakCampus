import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import SideNav from "../components/SideNav";
import PostGrid from "../components/PostGrid";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts } from "../redux/actions/postAction";
import NotificationsTab from "../components/features/NotificationsTab";
import { useParams } from "react-router-dom";
import PostPage from "./PostPage";
import axios from "../utils/axios";
import { RiHome2Fill } from "@remixicon/react";
import { fetchNotifications } from "../redux/actions/notificationAction";

function HomePage() {
  const [category, setCategory] = useState("all discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationTabActive, setIsNotificationTabActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [postArray, setPostArray] = useState([]);
  const { id } = useParams(); // Get the post ID from the URL if the route is "/post/:id"
  const reduxPosts = useSelector((state) => state.posts.posts);
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  const search = async (query, page = 1) => {
    setLoading(true); // Set loading to true when search starts
    try {
      const response = await axios.get(
        `/posts/search?query=${query}&page=${page}`
      );
      if (page === 1) {
        setPostArray(response.data); // Set new results for page 1
      } else {
        setPostArray((prevArray) => [...prevArray, ...response.data]); // Append new results for subsequent pages
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

  console.log("notifications:", notifications);

  return (
    <div className="relative w-screen h-[100vh] overflow-hidden">
      <TopNav
        category={category}
        searchFunc={search}
        isNotificationTabActive={isNotificationTabActive}
        toggleNotificationTab={toggleNotificationTab}
      />

      <div className="flex relative z-10">
        <SideNav setCategory={setCategory} />
        <div className="h-[88vh] mt-[12vh] w-[75%] py-10 px-2 overflow-auto">
          {postArray != useSelector((state) => state.posts.posts) && (
            <div className="flex items-end gap-4 ml-10">
              <RiHome2Fill
                onClick={() => navBack()}
                size={30}
                className="mt-5 ml-5 opacity-50 hover:opacity-100"
              />
              <h2 className="">{`Showing search result for ${searchQuery}:`}</h2>
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

      <NotificationsTab isNotificationTabActive={isNotificationTabActive} />
    </div>
  );
}

export default HomePage;
