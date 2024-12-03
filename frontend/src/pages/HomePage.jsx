import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import SideNav from "../components/SideNav";
import PostGrid from "../components/PostGrid";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts } from "../redux/actions/postAction";
import NotificationsTab from "../components/features/NotificationsTab";

function HomePage() {
  const [isNotificationTabActive, setIsNotificationTabActive] = useState(false);
  const dispatch = useDispatch();
  const postArray = useSelector((state) => state.posts.posts);
  console.log(postArray);

  const toggleNotificationTab = () => {
    setIsNotificationTabActive((prevState) => !prevState);
  };

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="relative w-screen h-[100vh] overflow-hidden">
      <TopNav
        category={"all discussion"}
        isNotificationTabActive={isNotificationTabActive}
        toggleNotificationTab={toggleNotificationTab}
      />

      <div className="flex relative z-10">
        <SideNav />
        {postArray ? (
          <PostGrid className="flex-grow" postsArray={postArray} />
        ) : (
          "loading"
        )}
      </div>

      <NotificationsTab isNotificationTabActive={isNotificationTabActive} />
    </div>
  );
}

export default HomePage;
