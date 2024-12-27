import React from "react";
import Post from "./partials/Post";

function PostGrid({ postsArray, category }) {
  return (
    <div>
      {postsArray ? (
        postsArray.map((post, index) => {
          if (
            category === "all discussion" ||
            (post.category && post.category === category)
          ) {
            return <Post key={index} postdata={post} />;
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
