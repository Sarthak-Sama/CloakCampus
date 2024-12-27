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

function HomePage() {
  const [category, setCategory] = useState("all discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationTabActive, setIsNotificationTabActive] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const dispatch = useDispatch();
  const [postArray, setPostArray] = useState(
    useSelector((state) => state.posts.posts)
  );
  const { id } = useParams(); // Get the post ID from the URL if the route is "/post/:id"

  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  const search = async (query, page = 1) => {
    setLoading(true); // Set loading to true when search starts
    try {
      const response = await axios.get(
        `/posts/search?query=${query}&page=${page}`
      );
      console.log(`/posts/search?query=${query}&page=${page}`);
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

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

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

      <NotificationsTab isNotificationTabActive={isNotificationTabActive} />
    </div>
  );
}

export default HomePage;
