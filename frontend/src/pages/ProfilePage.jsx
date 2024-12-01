import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../redux/actions/userAction";

function ProfilePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);
  const { user } = useSelector((state) => state.user);
  return (
    <div className="flex">
      <div
        id="info-div"
        className="items-center w-[20rem] h-screen pt-16 pl-14"
      >
        <div id="profile" className="flex flex-col items-center w-full">
          <div
            id="profile-img"
            className="bg-red-200 w-[15rem] h-[15rem] rounded-full"
          ></div>
          <h2 className="text-3xl text-center">{user.username}</h2>
        </div>

        <hr className="border-zinc-300 w-[90%] border-[1px] my-5 mx-auto" />
        <div id="details" className="w-full ml-4">
          <h3 className="text-zinc-500 text-sm">Email</h3>
          <h3 className="text-lg">{user.email}</h3>
          <h3 className="text-zinc-500 text-sm mt-3">University</h3>
          <h3 className="text-lg">{user.university}</h3>
          <h3 className="text-zinc-500 text-sm mt-3">Password</h3>
          <h3 className="text-lg">*******</h3>
          <h3 className="text-zinc-500 text-sm mt-3">Member Since </h3>
          <h3 className="text-lg">{user.createdAt.slice(0, 10)}</h3>
        </div>
      </div>
      <div id="posts-div" className="w-full h-screen">
        <h1 className="text-3xl text-center mt-20 uppercase">Your Posts</h1>
      </div>
    </div>
  );
}

export default ProfilePage;
