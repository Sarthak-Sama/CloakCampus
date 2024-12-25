import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../redux/actions/userAction";
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiMailLine,
} from "@remixicon/react";
import { fetchPosts } from "../redux/actions/postAction";
import Post from "../components/partials/Post";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchPosts());
  }, [dispatch]);
  const { user } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  return (
    <>
      {user ? (
        <div className="md:flex block max-w-screen relative">
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

            <hr className="border-zinc-300 w-[90%] border-[1px] my-5 mx-auto" />
            <div id="details" className="w-full ml-4">
              <div className="w-full p-3 mb-1 flex items-center justify-between rounded-lg group">
                <div className="p-2 bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Email</h3>
                  <h3 className="text-lg">{user.email}</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
              <div className="w-full mb-1 flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">University</h3>
                  <h3 className="text-lg">{user.university}</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
              <div className="w-full flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-zinc-500 rounded-[0.3rem]">
                  <RiMailLine />
                </div>
                <div className="w-full px-2">
                  <h3 className="text-zinc-500 text-sm">Password</h3>
                  <h3 className="text-lg">*******</h3>
                </div>
                <RiArrowRightSLine className="group-hover:translate-x-2 transition-all duration-[0.3] ease-out" />
              </div>
              <div className="w-full flex items-center justify-between p-3 rounded-lg group">
                <div className="p-2 bg-zinc-500 rounded-[0.3rem]">
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
              {posts.map((post, index) => {
                if (post.author === user._id) {
                  return <Post key={post._id} postdata={post} />;
                }
              })}
            </div>
          </div>
        </div>
      ) : (
        "Loading"
      )}
    </>
  );
}

export default ProfilePage;
