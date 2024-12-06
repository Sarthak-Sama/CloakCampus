import {
  RiMessage2Fill,
  RiMessage2Line,
  RiMore2Line,
  RiShareLine,
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from "@remixicon/react";
import React, { useState } from "react";
import axios from "../../utils/axios";

function Post({ postdata }) {
  const [likeBtnActive, setLikeBtnActive] = useState(false);
  const [dislikeBtnActive, setDislikeBtnActive] = useState(false);
  const [commentBtnActive, setCommentBtnActive] = useState(false);
  const [likeCount, setLikeCount] = useState(postdata.upvoteCount);
  const [dislikeCount, setDisLikeCount] = useState(postdata.downvoteCount);

  const handleLike = () => {
    setLikeCount(likeCount + 1);
    try {
      const response = axios.patch(`/posts/upvote/${postdata._id}`);
    } catch (err) {
      console.log(err);
      setLikeCount(likeCount - 1);
    }
  };
  const handleDisike = () => {
    setDisLikeCount(dislikeCount + 1);
  };

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

  return (
    <>
      <div className="w-[75%] mx-auto rounded-[0.9rem] my-3 p-5 gap-8 bg-zinc-800 text-[#EDEDED]">
        <div className="flex gap-5 pr-6">
          {postdata.media && postdata.media.length > 0 && (
            <div id="thumbnail" className="w-[35%] flex flex-wrap gap-4">
              {postdata.media.map((image) => {
                return image.type === "image" ? (
                  <img
                    className="max-w-full h-auto rounded-[0.6rem] shadow-md"
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
          <div id="content" className="w-full">
            <div className="flex items-center justify-between">
              <h1 className="text-[1.7rem]">{postdata.title}</h1>
              <h3 className="text-xs text-zinc-500">{timeAgo}</h3>
            </div>

            <h3 className="text-xs text-zinc-400">
              Posted by <b>{postdata.authorUsername}</b>
            </h3>
            <p className="mt-5 ">{postdata.textContent}</p>
          </div>
        </div>
        <div
          id="operations"
          className="flex w-[100%] justify-between mt-5 pl-2"
        >
          <div className="w-[35%] flex justify-between">
            <div
              id="like"
              className="flex gap-4"
              onClick={handleLike}
              onMouseEnter={() => {
                setLikeBtnActive(true);
                setDislikeBtnActive(false);
                setCommentBtnActive(false);
              }}
              onMouseLeave={() => {
                setLikeBtnActive(false);
              }}
            >
              {likeBtnActive ? <RiThumbUpFill /> : <RiThumbUpLine />}
              <span>{postdata.upvoteCount > 0 && postdata.upvoteCount}</span>
            </div>
            <div
              id="dislike"
              className="flex gap-2"
              onClick={handleDisike}
              onMouseEnter={() => {
                setDislikeBtnActive(true);
                setLikeBtnActive(false);
                setCommentBtnActive(false);
              }}
              onMouseLeave={() => {
                setDislikeBtnActive(false);
              }}
            >
              {dislikeBtnActive ? <RiThumbDownFill /> : <RiThumbDownLine />}
              <span>
                {postdata.downvoteCount > 0 && postdata.downvoteCount}
              </span>
            </div>
            <div
              id="comment"
              onMouseEnter={() => {
                setCommentBtnActive(true);
                setLikeBtnActive(false);
                setDislikeBtnActive(false);
              }}
              onMouseLeave={() => {
                setCommentBtnActive(false);
              }}
            >
              {commentBtnActive ? <RiMessage2Fill /> : <RiMessage2Line />}
            </div>
          </div>
          <div className="w-[10%] flex justify-between pr-6 gap-3">
            <div>
              <RiShareLine />
            </div>
            <div>
              <RiMore2Line />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;
