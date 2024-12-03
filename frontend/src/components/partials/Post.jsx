import React from "react";

function Post({ postdata }) {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const difference = now - createdAt;

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  };
  const timeAgo = getTimeAgo(postdata.createdAt);
  console.log(postdata);
  return (
    <>
      <div className="w-[75%] mx-auto rounded-[20px] my-3 p-4 flex gap-8 bg-zinc-800 text-[#EDEDED]">
        {postdata.media && postdata.media.length > 0 && (
          <div id="thumbnail" className="w-[35%] flex flex-wrap gap-4">
            {postdata.media.map((image) => {
              return image.type === "image" ? (
                <img
                  className="max-w-full h-auto rounded-lg shadow-md"
                  key={image._id}
                  src={image.url}
                  alt="Post media"
                />
              ) : (
                <video
                  key={image._id}
                  src={image.url}
                  controls
                  className="w-full max-w-lg h-auto rounded-lg shadow-md"
                />
              );
            })}
          </div>
        )}
        <div id="content">
          <h1 className="text-[1.7rem]">{postdata.title}</h1>
          <h3 className="text-xs text-zinc-400">
            Posted by {postdata.authorUsername}; <b>{timeAgo}</b>
          </h3>
          <p className="mt-5 ">{postdata.textContent}</p>
        </div>
      </div>
    </>
  );
}

export default Post;
