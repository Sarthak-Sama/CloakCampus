import {
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

  // const handleLike = async () => {
  //   if (isLoading) return; // Prevent multiple clicks
  //   setIsLoading(true);

  //   if (userVote !== "upvote") {
  //     // Optimistically update UI
  //     setLikeCount(likeCount + 1);
  //     if (userVote === "downvote") setDisLikeCount(dislikeCount - 1);
  //     setUserVote("upvote");

  //     try {
  //       await axios.patch(`/posts/upvote/${postdata._id}`);
  //     } catch (err) {
  //       console.error("Error while liking:", err);

  //       // Revert optimistic updates on error
  //       setLikeCount(likeCount - 1);
  //       if (userVote === "downvote") setDisLikeCount(dislikeCount + 1);
  //       setUserVote(userVote);
  //     }
  //   } else {
  //     // Handle unvoting a like
  //     setLikeCount(likeCount - 1);
  //     setUserVote("");
  //     try {
  //       await axios.delete(`/posts/upvote/${postdata._id}`);
  //     } catch (error) {
  //       console.error("Error while removing like:", error);

  //       // Revert optimistic updates on error
  //       setLikeCount(likeCount + 1);
  //       setUserVote("upvote");
  //     }
  //   }
  //   setIsLoading(false);
  // };

  // const handleDislike = async () => {
  //   if (isLoading) return; // Prevent multiple clicks
  //   setIsLoading(true);

  //   if (userVote !== "downvote") {
  //     // Optimistically update UI
  //     setDisLikeCount(dislikeCount + 1);
  //     if (userVote === "upvote") setLikeCount(likeCount - 1);
  //     setUserVote("downvote");

  //     try {
  //       await axios.patch(`/posts/downvote/${postdata._id}`);
  //     } catch (err) {
  //       console.error("Error while disliking:", err);

  //       // Revert optimistic updates on error
  //       setDisLikeCount(dislikeCount - 1);
  //       if (userVote === "upvote") setLikeCount(likeCount + 1);
  //       setUserVote(userVote);
  //     }
  //   } else {
  //     // Handle unvoting a dislike
  //     setDisLikeCount(dislikeCount - 1);
  //     setUserVote("");
  //     try {
  //       await axios.delete(`/posts/downvote/${postdata._id}`);
  //     } catch (error) {
  //       console.error("Error while removing dislike:", error);

  //       // Revert optimistic updates on error
  //       setDisLikeCount(dislikeCount + 1);
  //       setUserVote("downvote");
  //     }
  //   }
  //   setIsLoading(false);
  // };

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
              onClick={() => handleVote("upvote")}
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
              onClick={() => handleVote("downvote")}
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
              onClick={() => setCommentInputVisible(!commentInputVisible)}
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
          <div className="w-[10%] flex justify-between pr-6 gap-3">
            <div>
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
    </>
  );
}

export default Post;
