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
import React, { useState, useRef } from "react";
import axios from "../../utils/axios";
import { Link } from "react-router-dom";
import { set } from "lodash";

function Post({ postdata, setIsLinkCopiedNotificationVisible, setPopupText }) {
  const [likeCount, setLikeCount] = useState(postdata.upvoteCount);
  const [dislikeCount, setDisLikeCount] = useState(postdata.downvoteCount);
  const [commentCount, setCommentCount] = useState(postdata.comments.length);
  const [userVote, setUserVote] = useState(postdata.userVote);
  const [isLoading, setIsLoading] = useState(false); // Prevent multiple clicks
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHoveredOverSendIcon, setIsHoveredOverSendIcon] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportReason, setReportReason] = useState("");

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
    if (!commentText) return;
    setCommentInputVisible(false);
    try {
      axios.post(`/posts/${postdata._id}/comment`, {
        content: commentText,
      });
      setCommentText("");
      setCommentCount(commentCount + 1);
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
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    }
    setPopupText("Link copied to clipboard.");
    setIsLinkCopiedNotificationVisible(true);
    setInterval(() => {
      setIsLinkCopiedNotificationVisible(false);
    }, 2000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum distance for swipe

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swiped left, show next image
        handleNextImage(e);
      } else {
        // Swiped right, show previous image
        handlePrevImage(e);
      }
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleReport = async (e) => {
    try {
      await axios.post(`/posts/report/${postdata._id}`, {
        category: reportCategory,
        reason: reportReason,
      });
      setPopupText("Thanks for reporting.");
      setReportDialogOpen(false);
      // Optional: Show success notification
    } catch (error) {
      if (error.response?.status === 409) {
        console.error(error.response.data.message);
        setPopupText("Failed to report post.");
      } else {
        setPopupText("Failed to report post.");
      }
    }
  };

  return (
    <Link className="" to={`/post/${postdata._id}`}>
      <div className="w-[80%] md:w-[80%] lg:w-[75%] mx-auto rounded-[0.6rem] sm:rounded-[0.9rem] my-3 p-5 gap-8 bg-zinc-300 dark:bg-zinc-800 text-[#161616] dark:text-[#EDEDED]">
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-5 pr-6">
          {postdata.media && postdata.media.length > 0 && (
            <div
              id="thumbnail"
              className="w-[100%] translate-x-[3%] sm:w-[50%] lg:w-[50%] rounded-[0.6rem] overflow-hidden relative group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {postdata.media[currentImageIndex].type === "image" ? (
                <img
                  className="w-full max-h-[20rem] object-cover object-center shadow-md"
                  src={postdata.media[currentImageIndex].url}
                  alt="Post media"
                />
              ) : (
                <video
                  src={postdata.media[currentImageIndex].url}
                  controls
                  className="w-full max-w-lg h-auto shadow-md"
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
              className="flex gap-4 group"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling to the parent Link
                handleVote("upvote");
              }}
            >
              <RiThumbUpLine
                className={`${
                  userVote === "upvote" ? "hidden" : "block group-hover:hidden"
                }`}
              />
              <RiThumbUpFill
                className={`${
                  userVote === "upvote" ? "block" : "hidden group-hover:block"
                }`}
              />
              <span>{likeCount > 0 && likeCount}</span>
            </div>
            <div
              id="dislike"
              className="flex gap-2 group"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling to the parent Link
                handleVote("downvote");
              }}
            >
              <RiThumbDownLine
                className={`${
                  userVote === "downvote"
                    ? "hidden"
                    : "block group-hover:hidden"
                }`}
              />
              <RiThumbDownFill
                className={`${
                  userVote === "downvote" ? "block" : "hidden group-hover:block"
                }`}
              />
              <span>{dislikeCount > 0 && dislikeCount}</span>
            </div>
            <div
              id="comment"
              className="group flex gap-4"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling to the parent Link
                setCommentInputVisible(!commentInputVisible);
              }}
            >
              <RiMessage2Fill
                className={
                  commentInputVisible ? "block" : "hidden group-hover:block"
                }
              />

              <RiMessage2Line
                className={
                  commentInputVisible ? "hidden" : "block group-hover:hidden"
                }
              />
              <span>{commentCount > 0 && commentCount}</span>
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
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReportDialogOpen(true);
              }}
            >
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
      {reportDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setReportDialogOpen(false);
          }}
        >
          <div
            className="w-[90%] max-w-md bg-zinc-300 dark:bg-zinc-800 rounded-lg p-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#161616] dark:text-[#EDEDED]">
              Report Post
            </h2>

            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full p-2 mb-4 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[#161616] dark:text-[#EDEDED] border border-zinc-400 dark:border-zinc-600"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Spam">Spam</option>
              <option value="Harassment">Harassment</option>
              <option value="Hate Speech">Hate Speech</option>
              <option value="False Information">Misinformation</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide additional details..."
              className="w-full p-2 mb-4 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[#161616] dark:text-[#EDEDED] border border-zinc-400 dark:border-zinc-600 min-h-[100px] resize-none"
            />

            <div className="flex justify-center sm:justify-end gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setReportDialogOpen(false);
                }}
                className="px-4 py-2 rounded-md bg-zinc-400 dark:bg-zinc-600 text-[#161616] dark:text-[#EDEDED] hover:bg-zinc-500 dark:hover:bg-zinc-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleReport();
                }}
                disabled={!reportCategory || !reportReason}
                className={`px-4 py-2 rounded-md ${
                  !reportCategory || !reportReason
                    ? "bg-zinc-500 cursor-not-allowed"
                    : "bg-[#ea516f] hover:bg-[#d4465f]"
                } text-white transition-colors`}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

export default Post;
