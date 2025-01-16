import axios from "../utils/axios";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import Comment from "../components/partials/Comment";
import { useSelector } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [localPost, setLocalPost] = useState(null);
  const [likeBtnActive, setLikeBtnActive] = useState(false);
  const [dislikeBtnActive, setDislikeBtnActive] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDisLikeCount] = useState(0);
  const [userVote, setUserVote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHoveredOverSendIcon, setIsHoveredOverSendIcon] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [isRendered, setIsRendered] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      const { data } = await axios.get(`/posts/${id}`);
      setLocalPost(data.post);
    } catch (error) {
      navigate("/loading");
    }
  };

  const fetchComments = async () => {
    console.log("Fetching comments...");
    if (isLoadingComments || !hasMoreComments) return;
    setIsLoadingComments(true);
    try {
      const { data } = await axios.get(`/posts/${id}/comments?page=${page}`);
      setComments((prevComments) => [...prevComments, ...data.comments]);
      const hasMore =
        data.pagination.currentPage !== data.pagination.totalPages;
      setHasMoreComments(hasMore);
      setPage(page + 1);
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 500) {
      fetchComments();
    }
  };
  useEffect(() => {
    fetchPost();
    console.log(localPost);
    fetchComments();
    console.log(comments);
  }, [id, navigate]);

  useEffect(() => {
    if (localPost) {
      setLikeCount(localPost.upvoteCount);
      setDisLikeCount(localPost.downvoteCount);
      setUserVote(localPost.userVote);
    }
  }, [localPost]);

  const updateNestedComments = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: [newReply, ...(comment.replies || [])], // Add new reply at the top
        };
      }

      // Recursively update nested replies
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateNestedComments(comment.replies, parentId, newReply),
        };
      }

      return comment;
    });
  };

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
          await axios.patch(`/posts/upvote/${localPost._id}`);
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
          await axios.delete(`/posts/upvote/${localPost._id}`);
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
          await axios.patch(`/posts/downvote/${localPost._id}`);
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
          await axios.delete(`/posts/downvote/${localPost._id}`);
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

  const handleCommentSubmit = async (e) => {
    if (isSubmittingComment || !commentText.trim()) return;
    e.preventDefault();
    setIsSubmittingComment(true);
    try {
      const { data } = await axios.post(`/posts/${id}/comment`, {
        content: commentText,
      });
      setCommentText("");
      setComments((prevComments) => [data.comment, ...prevComments]);
      setIsSubmittingComment(false);
    } catch (err) {
      console.log("Error while commenting: ", err);
    }
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? localPost.media.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === localPost.media.length - 1 ? 0 : prev + 1
    );
  };

  const renderComments = (comments) => {
    return comments.map((comment) => (
      <Comment
        key={comment._id}
        comment={comment}
        setComments={setComments}
        updateNestedComments={updateNestedComments}
      />
    ));
  };

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.href}`);
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    }
  };

  useEffect(() => {
    // Set state to true when component is fully rendered
    if (localPost) setIsRendered(true);
  }, [localPost]); // Empty array ensures this runs once when the component is mounted

  useEffect(() => {
    if (isRendered) {
      const fragment = window.location.hash; // Use window.location.hash for reliability
      console.log(fragment);

      if (fragment) {
        const container = containerRef.current; // Ensure this points to the correct container
        const element = document.querySelector(fragment);
        console.log(container);
        console.log(element);

        if (element && container) {
          const offsetTop = element.offsetTop - container.offsetTop;
          console.log(offsetTop);
          container.scrollTo({
            top: 500,
            behavior: "smooth",
          });
        } else {
          console.error("Element or container not found");
        }
      }
    } else {
      console.log("Component not yet rendered");
    }
  }, [isRendered]); // Only depend on isRendered

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

  const handleReport = async () => {
    try {
      await axios.post(`/posts/report/${id}`, {
        category: reportCategory,
        reason: reportReason,
      });
      setReportDialogOpen(false);
      // Optional: Add success notification
    } catch (error) {
      if (error.response?.status === 409) {
        console.error(error.response.data.message);
      } else {
        console.error("Failed to report post");
      }
    }
  };

  console.log(comments);

  return (
    <>
      {localPost ? (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="mt-[-4vh] h-[88vh] overflow-auto p-10 dark:text-white"
        >
          <div
            id="information"
            className="flex flex-col md:flex-row md:items-between"
          >
            <div id="images">
              {localPost.media && localPost.media.length > 0 && (
                <div
                  id="thumbnail"
                  className="w-[100%] sm:w-[80%] md:w-[75%] md:mb-0 mb-10 mx-auto flex overflow-hidden relative group"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {localPost.media[currentImageIndex].type === "image" ? (
                    <img
                      className="max-w-full h-auto rounded-[0.6rem] shadow-md"
                      key={localPost.media[currentImageIndex]._id}
                      src={localPost.media[currentImageIndex].url}
                      alt="Post media"
                    />
                  ) : (
                    <video
                      key={localPost.media[currentImageIndex]._id}
                      src={localPost.media[currentImageIndex].url}
                      controls
                      className="w-full max-w-lg h-auto rounded-lg shadow-md"
                    />
                  )}
                  {localPost.media.length > 1 && (
                    <>
                      <div
                        onClick={handlePrevImage}
                        id="left-arrow"
                        className="absolute w-6 h-6 bg-[#efefef] opacity-60 group-hover:opacity-100 flex items-center justify-center rounded-full top-1/2 left-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <RiArrowLeftSLine color="#191919" />
                      </div>
                      <div
                        onClick={handleNextImage}
                        id="right-arrow"
                        className="absolute w-6 h-6 bg-[#efefef] opacity-60 group-hover:opacity-100 flex items-center justify-center rounded-full top-1/2 right-6 translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <RiArrowRightSLine color="#191919" />
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                        {localPost.media.map((_, index) => (
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
            </div>
            <div
              id="content-and-operations"
              className="w-full flex flex-col justify-between"
            >
              <div id="content">
                <div className="flex items-center justify-between gap-5">
                  <h1 className="text-[1.7rem] leading-[2rem]">
                    {localPost.title}
                  </h1>
                  <h3 className="text-xs text-zinc-500">
                    {new Date(localPost.createdAt).toLocaleString()}
                  </h3>
                </div>

                <h3 className="text-xs text-zinc-600 dark:text-zinc-400">
                  Posted by <b>{localPost.authorUsername}</b>
                </h3>
                {localPost.category && (
                  <div className="w-fit px-4 py-[0.25rem] bg-[#ea516f] w-fit text-xs text-white rounded-full my-2">
                    {localPost.category}
                  </div>
                )}
                <p className="mt-5 ">{localPost.textContent}</p>
              </div>
              <div
                id="operations"
                className="flex w-[100%] justify-between mt-5 pl-2"
              >
                <div className="w-[35%] flex justify-between">
                  <div
                    id="like"
                    className="flex gap-4"
                    onClick={() => handleVote("upvote")}
                    onMouseEnter={() => {
                      setLikeBtnActive(true);
                      setDislikeBtnActive(false);
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
                    onClick={() => handleVote("downvote")}
                    onMouseEnter={() => {
                      setDislikeBtnActive(true);
                      setLikeBtnActive(false);
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
                </div>
                <div className="w-[10%] flex justify-between pr-6 gap-3">
                  <div onClick={() => copyUrlToClipboard()}>
                    <RiShareLine />
                  </div>
                  <div onClick={() => setReportDialogOpen(true)}>
                    <RiMore2Line />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="border-zinc-500 rounded-full w-full mb-4 mt-6" />
          <div id="comment-section">
            <h2 className="text-[2rem] mt-5">
              <i>Comments</i>
            </h2>
            <div id="comment-input" className="w-full mt-5">
              <form
                onSubmit={handleCommentSubmit}
                className="w-full flex gap-5 items-center justify-between px-2 mb-10"
              >
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    const charCount = e.target.value.length;
                    if (words.length <= 300 && charCount <= 1500) {
                      setCommentText(e.target.value);
                    } else if (words.length > 300) {
                      const limitedText = e.target.value
                        .trim()
                        .split(/\s+/)
                        .slice(0, 300)
                        .join(" ");
                      setCommentText(limitedText);
                    } else if (charCount > 1500) {
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
                  {isSubmittingComment ? (
                    <div className="flex items-center justify-center scale-[0.5]">
                      <svg
                        className="loader-container"
                        viewBox="0 0 40 40"
                        height="40"
                        width="40"
                      >
                        <circle
                          className="loader-track"
                          cx="20"
                          cy="20"
                          r="17.5"
                          pathLength="100"
                          strokeWidth="5"
                          fill="none"
                        />
                        <circle
                          className="loader-car"
                          cx="20"
                          cy="20"
                          r="17.5"
                          pathLength="100"
                          strokeWidth="5"
                          fill="none"
                        />
                      </svg>

                      <style jsx>{`
                        .loader-container {
                          --uib-size: 40px;
                          --uib-color: #ea516f;
                          --uib-speed: 2s;
                          --uib-bg-opacity: 0;
                          height: var(--uib-size);
                          width: var(--uib-size);
                          transform-origin: center;
                          animation: rotate var(--uib-speed) linear infinite;
                          overflow: visible;
                        }

                        .loader-car {
                          fill: none;
                          stroke: var(--uib-color);
                          stroke-dasharray: 1, 200;
                          stroke-dashoffset: 0;
                          stroke-linecap: round;
                          animation: stretch calc(var(--uib-speed) * 0.75)
                            ease-in-out infinite;
                          will-change: stroke-dasharray, stroke-dashoffset;
                          transition: stroke 0.5s ease;
                        }

                        .loader-track {
                          fill: none;
                          stroke: var(--uib-color);
                          opacity: var(--uib-bg-opacity);
                          transition: stroke 0.5s ease;
                        }

                        @keyframes rotate {
                          100% {
                            transform: rotate(360deg);
                          }
                        }

                        @keyframes stretch {
                          0% {
                            stroke-dasharray: 0, 150;
                            stroke-dashoffset: 0;
                          }
                          50% {
                            stroke-dasharray: 75, 150;
                            stroke-dashoffset: -25;
                          }
                          100% {
                            stroke-dashoffset: -100;
                          }
                        }
                      `}</style>
                    </div>
                  ) : (
                    <RiSendPlaneFill
                      color={
                        isHoveredOverSendIcon
                          ? theme === "dark"
                            ? "#EA516F"
                            : "#D71B53"
                          : theme === "dark"
                          ? "#EDEDED"
                          : "#4A4A4A"
                      }
                      onMouseEnter={() => {
                        setIsHoveredOverSendIcon(true);
                      }}
                      onMouseLeave={() => {
                        setIsHoveredOverSendIcon(false);
                      }}
                    />
                  )}
                </button>
              </form>
            </div>
            <div id="comments">
              {comments.length > 0 ? (
                <>
                  {renderComments(comments)}
                  {isLoadingComments && (
                    <div className="text-center py-4">
                      Loading more comments...
                    </div>
                  )}
                </>
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-[-4vh] pt-0 md:pt-10 h-[88vh] overflow-auto p-10 dark:text-white">
          <div className="flex flex-col items-center md:flex-row md:items-between gap-10">
            <div id="images-skeleton" className="w-[100%] md:w-[40%] h-[54vh]">
              <Skeleton width={"100%"} height={400} />
            </div>
            <div
              id="information-skeleton"
              className="w-[100%] h-[54vh] md:w-[50%] flex flex-col justify-between"
            >
              <div>
                <Skeleton className="mb-5" width={"100%"} height={50} />
                <Skeleton
                  className="mt-2"
                  count={7}
                  width={"100%"}
                  height={25}
                />
              </div>
              <div className="hidden md:block">
                <Skeleton width={"100%"} height={25} />
              </div>
            </div>
          </div>
          <div
            id="comment-section-skeleton"
            className="w-[100%] md:w-[94%] mt-10 hidden md:block"
          >
            <Skeleton width={"100%"} height={50} />
            <Skeleton className="mt-5" width={"100%"} height={15} />
          </div>
        </div>
      )}
      {reportDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setReportDialogOpen(false)}
        >
          <div
            className="w-[90%] max-w-md bg-zinc-300 dark:bg-zinc-800 rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
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

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReportDialogOpen(false)}
                className="px-4 py-2 rounded-md bg-zinc-400 dark:bg-zinc-600 text-[#161616] dark:text-[#EDEDED] hover:bg-zinc-500 dark:hover:bg-zinc-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
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
    </>
  );
}

export default PostPage;
