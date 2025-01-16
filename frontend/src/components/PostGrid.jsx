import React from "react";
import Post from "./partials/Post";
import Skeleton from "react-loading-skeleton";

function PostGrid({
  postsArray,
  category,
  setIsLinkCopiedNotificationVisible,
  setPopupText,
}) {
  // Add scroll event listener

  return (
    <div className="w-full">
      {postsArray ? (
        postsArray.map((post, index) => {
          if (
            category === "all discussion" ||
            (post.category && post.category === category)
          ) {
            return (
              <Post
                key={index}
                postdata={post}
                setIsLinkCopiedNotificationVisible={
                  setIsLinkCopiedNotificationVisible
                }
                setPopupText={setPopupText}
              />
            );
          }
          return null; // Skip rendering if post doesn't match the category
        })
      ) : (
        <div className="w-full h-[88vh] flex justify-center">
          <div className="w-[75%]">
            <Skeleton className="mt-5" count={4} width={"100%"} height={270} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PostGrid;
