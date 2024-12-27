import React from "react";
import Post from "./partials/Post";

function PostGrid({ postsArray, category, searchQuery }) {
  console.log(searchQuery);
  return (
    <div className="h-[88vh] mt-[12vh] w-[75%] py-10 px-2 overflow-auto">
      {postsArray ? (
        postsArray
          .filter((post) => {
            // Filter posts by category
            const isInCategory =
              category === "all discussion" ||
              (post.category && post.category === category);

            // Filter posts by search query (case-insensitive)
            const matchesSearchQuery =
              searchQuery.trim() === "" ||
              (post.title &&
                post.title.toLowerCase().includes(searchQuery.toLowerCase()));

            return isInCategory && matchesSearchQuery;
          })
          .map((post, index) => <Post key={index} postdata={post} />)
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PostGrid;
