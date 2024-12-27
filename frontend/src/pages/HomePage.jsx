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
  const dispatch = useDispatch();
  const postArray = useSelector((state) => state.posts.posts);
  let searchedPostArray = [];
  const { id } = useParams(); // Get the post ID from the URL if the route is "/post/:id"

  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  const search = () => {
    axios.get();
  };

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="relative w-screen h-[100vh] overflow-hidden">
      <TopNav
        category={category}
        setSearchQuery={setSearchQuery}
        isNotificationTabActive={isNotificationTabActive}
        toggleNotificationTab={toggleNotificationTab}
      />

      <div className="flex relative z-10">
        <SideNav setCategory={setCategory} />
        {/* Conditionally render PostPage or PostGrid based on the URL */}
        {id ? (
          <PostPage /> // If there's a post ID in the URL, show PostPage
        ) : postArray ? (
          <PostGrid
            className="flex-grow"
            postsArray={searchQuery ? searchedPostArray : postArray}
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
