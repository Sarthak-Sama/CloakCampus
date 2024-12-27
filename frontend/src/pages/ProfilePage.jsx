import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedPostId, setSelectedPostId] = useState(null); // For tracking the post to delete
  const [showConfirmation, setShowConfirmation] = useState(false); // To show/hide the confirmation modal

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchPosts());
  }, [dispatch]);

  const { user } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);

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

  return (
    <>
      {user ? (
        <div className="md:flex block max-w-screen relative dark:text-white">
          <RiArrowLeftLine
            onClick={() => {
              navigate(-1);
            }}
            size={40}
            className="absolute left-0 top-0 mt-5 ml-5 opacity-50 hover:opacity-100"
          />
          <div
            id="info-div"
            className="items-center w-screen md:w-[20rem] md:h-screen pt-16 pl-10 pr-10 md:pr-0"
          >
            <div id="profile" className="flex flex-col items-center w-full">
              <div
                id="profile-img"
                style={{
                  backgroundImage: `url(${user.profilePictureSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top",
                  backgroundRepeat: "no-repeat",
                }}
                className="bg-red-200 w-[13rem] h-[13rem] rounded-full"
              ></div>
              <h2 className="text-3xl text-center mt-5">{user.username}</h2>
            </div>

            <hr className="border-zinc-600 dark:border-zinc-300 w-[90%] border-[1px] my-5 mx-auto" />
            <div id="details" className="w-full ml-4">
              <div className="w-full p-3 mb-1 flex items-center justify-between rounded-lg group">
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Email</h3>
                  <h3 className="text-lg">{user.email}</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
              <div className="w-full mb-1 flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">University</h3>
                  <h3 className="text-lg">{user.university}</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
              <div className="w-full flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Password</h3>
                  <h3 className="text-lg">*******</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
              <div className="w-full flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-[#161616] text-[#EDEDED] dark:text-[#161616] dark:bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Member Since</h3>
                  <h3 className="text-lg">{user.createdAt.slice(0, 10)}</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
            </div>
          </div>
          <div id="posts-div" className="w-full h-[90vh] lg:h-screen">
            <h1 className="text-3xl text-center mt-20 mb-5 uppercase">
              Your Posts
            </h1>
            <div className=" h-[100%] lg:h-[80%] overflow-y-scroll pt-5">
              {posts.map((post) => {
                if (post.author === user._id) {
                  return (
                    <div className="relative" key={post._id}>
                      <Post postdata={post} />
                      <div
                        className="absolute w-8 h-8 translate-x-1/2 -translate-y-1/2 right-[13%] top-1 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
                        onClick={() => handleDelete(post._id)}
                      >
                        <RiCloseLine color="#EFEFEF" />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      ) : (
        "Loading"
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg">
            <h3 className="text-xl mb-4">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-end space-x-4">
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
