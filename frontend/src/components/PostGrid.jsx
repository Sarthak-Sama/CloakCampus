import React from "react";
import Post from "./partials/Post";

function PostGrid({
  postsArray,
  category,
  setIsLinkCopiedNotificationVisible,
  setPopupText,
}) {
  // Add scroll event listener

  return (
    <div className="overflow-auto w-full h-fit">
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
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PostGrid;
