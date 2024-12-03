import React from "react";
import Post from "./partials/Post";

function PostGrid({ postsArray }) {
  return (
    <div className="h-[88vh] mt-[12vh] w-[75%] py-10 px-2 overflow-auto">
      {postsArray
        ? postsArray.map((post, index) => <Post key={index} postdata={post} />)
        : "loading"}
    </div>
  );
}

export default PostGrid;
