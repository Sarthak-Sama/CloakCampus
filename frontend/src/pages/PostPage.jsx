import axios from "../utils/axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [localPost, setLocalPost] = useState(null);
  const [likeBtnActive, setLikeBtnActive] = useState(false);
  const [dislikeBtnActive, setDislikeBtnActive] = useState(false);
  const [commentBtnActive, setCommentBtnActive] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDisLikeCount] = useState(0);
  const [userVote, setUserVote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHoveredOverSendIcon, setIsHoveredOverSendIcon] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`/posts/${id}`);
        setLocalPost(data.post);
      } catch (error) {
        navigate("/loading");
      }
    };

    fetchPost();
  }, [id, navigate]);

  useEffect(() => {
    if (localPost) {
      setLikeCount(localPost.upvoteCount);
      setDisLikeCount(localPost.downvoteCount);
      setUserVote(localPost.userVote);
      setComments(localPost.comments);
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
    e.preventDefault();
    setCommentInputVisible(false);
    try {
      const { data } = await axios.post(`/posts/${id}/comment`, {
        content: commentText,
      });
      setCommentText("");
      setComments((prevComments) => [data.comment, ...prevComments]);
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

  return (
    <>
      {localPost ? (
        <div className="w-[72%] h-[88vh] overflow-auto mt-[12vh] p-10">
          <div id="information" className="flex">
            <div id="images">
              {localPost.media && localPost.media.length > 0 && (
                <div
                  id="thumbnail"
                  className="w-[75%] flex overflow-hidden relative group"
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

                <h3 className="text-xs text-zinc-400">
                  Posted by <b>{localPost.authorUsername}</b>
                </h3>
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
            <div id="comments">
              {comments.length > 0 ? (
                renderComments(comments)
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Post not found</p>
      )}
    </>
  );
}

export default PostPage;
