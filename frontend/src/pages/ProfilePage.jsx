import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../redux/actions/userAction";
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiMailLine,
} from "@remixicon/react";
import { fetchPosts, deletePost } from "../redux/actions/postAction"; // Import delete action
import Post from "../components/partials/Post";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { throttle } from "lodash";

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPostId, setSelectedPostId] = useState(null); // For tracking the post to delete
  const [showConfirmation, setShowConfirmation] = useState(false); // To show/hide the confirmation modal
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [posts, setPosts] = useState([]);
  const postsContainerRef = useRef(null);
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const { user } = useSelector((state) => state.user);
  const { postsArray } = useSelector((state) => state.posts);

  const handleScroll = useCallback(
    throttle(() => {
      if (!isLoading && hasMore) {
        const { scrollTop, clientHeight, scrollHeight } =
          postsContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
          const currentScrollPos = scrollTop;
          setCurrentPage((prevPage) => prevPage + 1);
          // Immediately restore scroll position
          requestAnimationFrame(() => {
            if (postsContainerRef.current) {
              postsContainerRef.current.scrollTop = currentScrollPos;
            }
          });
        }
      }
    }, 300),
    [isLoading, hasMore]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (currentPage === 1) {
        const response = await dispatch(fetchPosts(currentPage));
        if (response) {
          setHasMore(response.hasMore);
          setPosts(response.posts);
          setIsLoading(false);
        }
      } else {
        // For subsequent pages, preserve scroll position
        setIsFetching(true);
        const scrollPosition = postsContainerRef.current?.scrollTop;
        const response = await dispatch(fetchPosts(currentPage));
        if (response) {
          setHasMore(response.hasMore);
          setPosts((prev) => [...prev, ...response.posts]);
          setIsLoading(false);
          setIsFetching(false);

          // Use multiple frames to ensure scroll position is maintained
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (postsContainerRef.current) {
                postsContainerRef.current.scrollTop = scrollPosition;
              }
            });
          });
        }
      }
    };
    if (currentPage === 1 && postsArray && postsArray.length > 0) {
      setPosts(postsArray);
    } else {
      fetchData();
    }
  }, [dispatch, currentPage]);

  const handleDelete = (postId) => {
    setSelectedPostId(postId);
    setShowConfirmation(true); // Show the confirmation popup
  };

  const confirmDelete = () => {
    dispatch(deletePost(selectedPostId)); // Dispatch delete action for the selected post
    setShowConfirmation(false); // Close the popup
  };

  const cancelDelete = () => {
    setShowConfirmation(false); // Just close the popup without deleting
    setSelectedPostId(null); // Reset selected post
  };

  const handleBackNavigation = () => {
    const previousURL = document.referrer;
    const isInternal = previousURL.includes(window.location.origin);

    if (location.state?.fromForgotPassword || !isInternal) {
      navigate("/", { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      {user ? (
        <div className="h-screen overflow-y-scroll w-screen md:flex block relative dark:text-white">
          <RiArrowLeftLine
            onClick={handleBackNavigation}
            size={40}
            className="absolute left-0 top-0 mt-5 ml-5 opacity-50 hover:opacity-100"
          />
          <div
            id="info-div"
            className="w-full md:w-[20rem] pt-16 pl-10 pr-10 md:pr-0"
          >
            <div id="profile" className="flex flex-col items-center w-full">
              <div
                id="profile-img"
                style={{
                  backgroundImage: `url(${"/media/profileIcon.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="w-[13rem] h-[13rem] rounded-full"
              >
                <img
                  src={user.profilePictureSrc}
                  className="w-full h-full rounded-full object-cover object-top"
                />
              </div>
              <h2 className="text-3xl text-center mt-5">{user.username}</h2>
            </div>

            <hr className="border-zinc-600 dark:border-zinc-300 w-[90%] border-[1px] my-5 mx-auto" />
            <div id="details" className="w-full ml-4">
              <div className="p-3 mb-1 flex items-center justify-between rounded-lg group">
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Email</h3>
                  <h3 className="text-lg">{user.email}</h3>
                </div>
              </div>
              <Link
                to={"/university"}
                className="w-full mb-1 flex items-center justify-between p-3 rounded-lg group"
              >
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">University</h3>
                  <h3 className="text-lg">{user.university}</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </Link>
              <Link
                to={"/forgot-password"}
                className="w-full flex items-center justify-between p-3 rounded-lg group"
              >
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Password</h3>
                  <h3 className="text-lg">*******</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </Link>
              <div className="w-full flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Member Since</h3>
                  <h3 className="text-lg">{user.createdAt.slice(0, 10)}</h3>
                </div>
              </div>
            </div>
          </div>
          <div id="posts-div" className="w-full h-[90vh] lg:h-screen">
            <h1 className="text-3xl text-center mt-20 mb-5 uppercase">
              Your Posts
            </h1>
            <div
              ref={postsContainerRef}
              onScroll={handleScroll}
              className=" h-[100%] lg:h-[80%] overflow-y-scroll pt-5"
            >
              {posts && posts.length > 0 ? (
                posts.map((post) => {
                  if (post.author === user._id) {
                    return (
                      <>
                        <div className="relative" key={post._id}>
                          <Post postdata={post} />
                          <div
                            className="absolute w-8 h-8 translate-x-1/2 -translate-y-1/2 right-[13%] top-1 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
                            onClick={() => handleDelete(post._id)}
                          >
                            <RiCloseLine color="#EFEFEF" />
                          </div>
                        </div>
                        {isFetching && (
                          <div className="flex items-center justify-center scale-[1] mt-2">
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
                                --uib-color: ${theme === "dark"
                                  ? "#EDEDED"
                                  : "#191919"};
                                --uib-speed: 2s;
                                --uib-bg-opacity: 0;
                                height: var(--uib-size);
                                width: var(--uib-size);
                                transform-origin: center;
                                animation: rotate var(--uib-speed) linear
                                  infinite;
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
                        )}
                      </>
                    );
                  }
                })
              ) : (
                <div className="w-full h-[88vh] flex justify-center">
                  <div className="w-[75%] relative">
                    <Skeleton
                      className="mt-5"
                      count={4}
                      width={"100%"}
                      height={180}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        "Loading"
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[80%] sm:w-fit bg-white p-5 rounded-lg">
            <h3 className="text-xl mb-4">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center sm:justify-end space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={cancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;
