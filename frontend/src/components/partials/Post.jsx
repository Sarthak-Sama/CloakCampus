import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMessage2Fill,
  RiMessage2Line,
  RiMore2Line,
  RiSendPlaneFill,
  RiShareLine,
  RiThumbDownFill,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbUpLine,
} from "@remixicon/react";
import React, { useState } from "react";
import axios from "../../utils/axios";
import { Link } from "react-router-dom";

function Post({ postdata }) {
  const [likeBtnActive, setLikeBtnActive] = useState(false);
  const [dislikeBtnActive, setDislikeBtnActive] = useState(false);
  const [commentBtnActive, setCommentBtnActive] = useState(false);
  const [likeCount, setLikeCount] = useState(postdata.upvoteCount);
  const [dislikeCount, setDisLikeCount] = useState(postdata.downvoteCount);
  const [userVote, setUserVote] = useState(postdata.userVote);
  const [isLoading, setIsLoading] = useState(false); // Prevent multiple clicks
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHoveredOverSendIcon, setIsHoveredOverSendIcon] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleVote = async (type) => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);

    let optimisticUpdate = {};
    let revertUpdate = {};

    if (type === "upvote") {
      if (userVote !== "upvote") {
        // Optimistic update for upvote
        optimisticUpdate = {
          likeCount: likeCount + 1,
          dislikeCount:
            userVote === "downvote" ? dislikeCount - 1 : dislikeCount,
          userVote: "upvote",
        };

        revertUpdate = {
          likeCount: likeCount,
          dislikeCount: userVote === "downvote" ? dislikeCount : dislikeCount,
          userVote: userVote,
        };

        setLikeCount(optimisticUpdate.likeCount);
        setDisLikeCount(optimisticUpdate.dislikeCount);
        setUserVote(optimisticUpdate.userVote);

        try {
          await axios.patch(`/posts/upvote/${postdata._id}`);
        } catch (err) {
          console.error("Error while liking:", err);
          // Revert changes on error
          setLikeCount(revertUpdate.likeCount);
          setDisLikeCount(revertUpdate.dislikeCount);
          setUserVote(revertUpdate.userVote);
        }
      } else {
        // Handle unvoting
        optimisticUpdate = {
          likeCount: likeCount - 1,
          userVote: "",
        };

        revertUpdate = {
          likeCount: likeCount,
          userVote: "upvote",
        };

        setLikeCount(optimisticUpdate.likeCount);
        setUserVote(optimisticUpdate.userVote);

        try {
          await axios.delete(`/posts/upvote/${postdata._id}`);
        } catch (err) {
          console.error("Error while unliking:", err);
          // Revert changes on error
          setLikeCount(revertUpdate.likeCount);
          setUserVote(revertUpdate.userVote);
        }
      }
    } else if (type === "downvote") {
      if (userVote !== "downvote") {
        // Optimistic update for downvote
        optimisticUpdate = {
          dislikeCount: dislikeCount + 1,
          likeCount: userVote === "upvote" ? likeCount - 1 : likeCount,
          userVote: "downvote",
        };

        revertUpdate = {
          dislikeCount: dislikeCount,
          likeCount: userVote === "upvote" ? likeCount : likeCount,
          userVote: userVote,
        };

        setDisLikeCount(optimisticUpdate.dislikeCount);
        setLikeCount(optimisticUpdate.likeCount);
        setUserVote(optimisticUpdate.userVote);

        try {
          await axios.patch(`/posts/downvote/${postdata._id}`);
        } catch (err) {
          console.error("Error while disliking:", err);
          // Revert changes on error
          setDisLikeCount(revertUpdate.dislikeCount);
          setLikeCount(revertUpdate.likeCount);
          setUserVote(revertUpdate.userVote);
        }
      } else {
        // Handle unvoting
        optimisticUpdate = {
          dislikeCount: dislikeCount - 1,
          userVote: "",
        };

        revertUpdate = {
          dislikeCount: dislikeCount,
          userVote: "downvote",
        };

        setDisLikeCount(optimisticUpdate.dislikeCount);
        setUserVote(optimisticUpdate.userVote);

        try {
          await axios.delete(`/posts/downvote/${postdata._id}`);
        } catch (err) {
          console.error("Error while un-disliking:", err);
          // Revert changes on error
          setDisLikeCount(revertUpdate.dislikeCount);
          setUserVote(revertUpdate.userVote);
        }
      }
    }

    setIsLoading(false);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    setCommentInputVisible(false);
    try {
      axios.post(`/posts/${postdata._id}/comment`, {
        content: commentText,
      });
      setCommentText("");
    } catch (err) {
      console.log("Error while commenting.: ");
    }
  };

  const handlePrevImage = (e) => {
    e.preventDefault(); // Prevent Link navigation
    setCurrentImageIndex((prev) =>
      prev === 0 ? postdata.media.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault(); // Prevent Link navigation
    setCurrentImageIndex((prev) =>
      prev === postdata.media.length - 1 ? 0 : prev + 1
    );
  };

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.href}post/${postdata._id}`
      );
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    }
  };

  return (
    <Link className="bg-red-200" to={`/post/${postdata._id}`}>
      <div className="w-[50%] md:w-[75%] mx-auto rounded-[0.6rem] md:rounded-[0.9rem] my-3 p-5 gap-8 bg-zinc-300 dark:bg-zinc-800 text-[#161616] dark:text-[#EDEDED]">
        <div className="md:flex gap-5 pr-6">
          {postdata.media && postdata.media.length > 0 && (
            <div
              id="thumbnail"
              className="w-[110%] lg:w-[35%] flex overflow-hidden relative group"
            >
              {postdata.media[currentImageIndex].type === "image" ? (
                <img
                  className="max-w-full h-auto rounded-[0.6rem] shadow-md"
                  key={postdata.media[currentImageIndex]._id}
                  src={postdata.media[currentImageIndex].url}
                  alt="Post media"
                />
              ) : (
                <video
                  key={postdata.media[currentImageIndex]._id}
                  src={postdata.media[currentImageIndex].url}
                  controls
                  className="w-full max-w-lg h-auto rounded-lg shadow-md"
                />
              )}
              {postdata.media.length > 1 && (
                <>
                  <div
                    onClick={handlePrevImage}
                    id="left-arrow"
                    className="absolute w-4 h-4 bg-[#efefef] opacity-60 group-hover:opacity-100 flex items-center justify-center rounded-full top-1/2 left-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <RiArrowLeftSLine color="#191919" />
                  </div>
                  <div
                    onClick={handleNextImage}
                    id="right-arrow"
                    className="absolute w-4 h-4 bg-[#efefef] opacity-60 group-hover:opacity-100 flex items-center justify-center rounded-full top-1/2 right-3 translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <RiArrowRightSLine color="#191919" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                    {postdata.media.map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-full ${
                          index === currentImageIndex
                            ? "bg-white w-2 h-2"
                            : "bg-gray-400 w-[.35rem] h-[.35rem] "
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div id="content" className="w-full mt-5 lg:mt-0">
            <div className="flex items-center justify-between gap-5">
              <h1 className="text-[1.5rem] leading-[1.5rem] lg:text-[1.7rem] lg:leading-[2rem]">
                {postdata.title}
              </h1>
              <h3 className="text-xs text-zinc-500">{timeAgo}</h3>
            </div>

            <h3 className="text-xs text-zinc-600 dark:text-zinc-400 my-2">
              Posted by <b>{postdata.authorUsername}</b>
            </h3>
            {postdata.category && (
              <div className="w-fit px-4 py-[0.25rem] bg-[#ea516f] w-fit text-xs text-white rounded-full">
                {postdata.category}
              </div>
            )}
            <p className="mt-5 ">{postdata.textContent}</p>
          </div>
        </div>
        <div
          id="operations"
          className="flex w-[100%] lg:w-[100%] justify-between mt-5 pl-0 lg:pl-2"
        >
          <div className="w-[80%] lg:w-[35%] flex justify-around lg:justify-between">
            <div
              id="like"
              className="flex gap-4"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling to the parent Link
                handleVote("upvote");
              }}
              onMouseEnter={() => {
                setLikeBtnActive(true);
                setDislikeBtnActive(false);
                setCommentBtnActive(false);
              }}
              onMouseLeave={() => {
                setLikeBtnActive(false);
              }}
            >
              {likeBtnActive || userVote === "upvote" ? (
                <RiThumbUpFill />
              ) : (
                <RiThumbUpLine />
              )}
              <span>{likeCount > 0 && likeCount}</span>
            </div>
            <div
              id="dislike"
              className="flex gap-2"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling to the parent Link
                handleVote("downvote");
              }}
              onMouseEnter={() => {
                setDislikeBtnActive(true);
                setLikeBtnActive(false);
                setCommentBtnActive(false);
              }}
              onMouseLeave={() => {
                setDislikeBtnActive(false);
              }}
            >
              {dislikeBtnActive || userVote === "downvote" ? (
                <RiThumbDownFill />
              ) : (
                <RiThumbDownLine />
              )}
              <span>{dislikeCount > 0 && dislikeCount}</span>
            </div>
            <div
              id="comment"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling to the parent Link
                setCommentInputVisible(!commentInputVisible);
              }}
              onMouseEnter={() => {
                setCommentBtnActive(true);
                setLikeBtnActive(false);
                setDislikeBtnActive(false);
              }}
              onMouseLeave={() => {
                setCommentBtnActive(false);
              }}
            >
              {commentBtnActive || commentInputVisible ? (
                <RiMessage2Fill />
              ) : (
                <RiMessage2Line />
              )}
            </div>
          </div>
          <div className="w-[20%] lg:w-[10%] flex justify-around lg:justify-between pr-6 gap-3">
            <div
              onClick={(e) => {
                e.preventDefault();
                copyUrlToClipboard();
              }}
            >
              <RiShareLine />
            </div>
            <div>
              <RiMore2Line />
            </div>
          </div>
        </div>
        {commentInputVisible && (
          <>
            <hr className="border-zinc-500 rounded-full w-full mb-4 mt-6" />
            <div id="comment-input" className="w-full">
              <form
                onSubmit={handleCommentSubmit}
                className="w-full flex gap-5 items-center justify-between px-2"
              >
                <textarea
                  value={commentText}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation
                    e.stopPropagation(); // Prevent event bubbling to the parent Link}
                  }}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    const charCount = e.target.value.length;
                    if (words.length <= 300 && charCount <= 1500) {
                      setCommentText(e.target.value);
                    } else if (words.length > 300) {
                      // Limit to 300 words
                      const limitedText = e.target.value
                        .trim()
                        .split(/\s+/)
                        .slice(0, 300)
                        .join(" ");
                      setCommentText(limitedText);
                    } else if (charCount > 1500) {
                      // Limit to 1500 characters
                      setCommentText(e.target.value.slice(0, 1500));
                    }
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  placeholder="Write a comment..."
                  className="w-full bg-transparent focus:outline-none focus:ring-0 resize-none"
                  rows="1"
                />
                <button type="submit">
                  <RiSendPlaneFill
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    color={isHoveredOverSendIcon ? "#EA516F" : "#EDEDED"}
                    onMouseEnter={() => {
                      setIsHoveredOverSendIcon(true);
                    }}
                    onMouseLeave={() => {
                      setIsHoveredOverSendIcon(false);
                    }}
                  />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

export default Post;
