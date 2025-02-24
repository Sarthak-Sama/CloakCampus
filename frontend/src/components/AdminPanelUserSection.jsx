import React, { useState, useEffect } from "react";
import axios from "../utils/axios";

function AdminPanelUserSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch blacklisted users when no search query is provided
  const fetchBlacklistedUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/admin/blacklisted-users");
      setBlacklistedUsers(response.data.blacklistedUsers);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching users");
    }
    setLoading(false);
  };

  // Search users using the searchUser endpoint
  const searchUser = async (query) => {
    setLoading(true);
    try {
      // Use encodeURIComponent to encode the query string correctly
      const response = await axios.get(
        `/admin/searchUser?q=${encodeURIComponent(query)}`
      );
      console.log(response.data.user);
      setSearchedUser(response.data.user);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Error searching users");
    }
    setLoading(false);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      return;
    } else {
      // Otherwise, search users based on the query
      searchUser(searchQuery);
    }
  };

  // Function to unblacklist a user
  const unblacklistUser = async (userId) => {
    setLoading(true);
    try {
      await axios.post("/admin/unblacklist-user", { userId });
      alert("User has been unblacklisted successfully.");
      // Remove the user from the list
      setBlacklistedUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Error unblacklisting user");
    }
    setLoading(false);
  };

  // On initial load, fetch blacklisted users
  useEffect(() => {
    fetchBlacklistedUsers();
  }, []);

  console.log("searched:", searchedUser);
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">User Search</h1>
      {/* Search Bar with a button */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search by User ID or Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring"
        />
        <button
          onClick={handleSearch}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          Search
        </button>
      </div>
      {/* Content */}
      {loading ? (
        <p>Searching...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : searchedUser ? (
        <div key={searchedUser._id} className="p-4 border rounded shadow-sm">
          <p className="font-semibold">Username: {searchedUser.username}</p>
          <p>Email: {searchedUser.email}</p>
          <p>User ID: {searchedUser._id}</p>
          <p>
            Blacklisted on:{" "}
            {new Date(searchedUser.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) : null}

      <h3 className="text-3xl mt-20 mb-5">Blacklisted Users</h3>
      {blacklistedUsers.length === 0 ? (
        <p>No users blacklisted.</p>
      ) : (
        <div className="space-y-4">
          {blacklistedUsers.map((user) => (
            <div key={user._id} className="p-4 border rounded shadow-sm">
              <p className="font-semibold">Username: {user.username}</p>
              <p>Email: {user.email}</p>
              <p>User ID: {user._id}</p>
              <p>
                Blacklisted on: {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => unblacklistUser(user._id)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
              >
                Unblacklist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanelUserSection;
