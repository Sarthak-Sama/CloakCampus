import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { deletePost } from "../../redux/actions/postAction";
import { prepareAutoBatched } from "@reduxjs/toolkit";

// A simple confirmation modal component
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded shadow-lg p-6 w-80">
      <p className="text-lg mb-4">{message}</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const ReportCard = ({ reportGroup, blacklistUser, setReports }) => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Manage modal state
  const [modalState, setModalState] = useState({
    show: false,
    type: "", // "delete" or "blacklist"
  });

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const getCategoryCounts = (categories) => {
    const categoryCounts = {};
    categories.forEach((categoryGroup) => {
      if (!categoryCounts[categoryGroup.category]) {
        categoryCounts[categoryGroup.category] = 0;
      }
      categoryCounts[categoryGroup.category] += categoryGroup.reports.length;
    });
    return categoryCounts;
  };

  const categoryCounts = getCategoryCounts(reportGroup.categories);

  const filteredCategories = selectedCategory
    ? reportGroup.categories.filter(
        (categoryGroup) => categoryGroup.category === selectedCategory
      )
    : reportGroup.categories;

  // Open modal for delete post
  const handleDeletePost = () => {
    setModalState({ show: true, type: "delete" });
  };

  // Open modal for blacklist user
  const handleBlacklistUser = () => {
    setModalState({ show: true, type: "blacklist" });
  };

  // Confirm actions from modal
  const onConfirm = () => {
    if (modalState.type === "delete") {
      dispatch(deletePost(reportGroup._id));
    } else if (modalState.type === "blacklist") {
      // Assuming reportGroup.postDetails[0].author holds the userId
      blacklistUser(reportGroup.postDetails[0].author);
    }
    setReports((prev) =>
      prev.filter((report) => report._id !== reportGroup._id)
    );
    // Close modal after action
    setModalState({ show: false, type: "" });
  };

  const onCancel = () => {
    setModalState({ show: false, type: "" });
  };

  return (
    <div className="w-[49%] h-[60vh] flex flex-col justify-between rounded-lg shadow-sm bg-[#EDEDED] dark:bg-zinc-800 text-[#161616] dark:text-[#EDEDED] px-7 py-5">
      <div>
        <h3 className="text-xl font-semibold flex items-center justify-between">
          Post ID: {reportGroup._id}
          <Link
            to={`/post/${reportGroup._id}`}
            className="text-zinc-500 hover:text-zinc-700 transition-all duration-200 ease-in-out"
          >
            View Post
          </Link>
        </h3>
        <div className="mb-4">
          <label className="block text-gray-700">Select Category:</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="mt-2 p-2 border rounded"
          >
            <option value="">All Categories</option>
            {[
              "False Information",
              "Hate Speech",
              "Harassment",
              "Spam",
              "Other",
            ].map((category) => (
              <option key={category} value={category}>
                {category} ({categoryCounts[category] || 0})
              </option>
            ))}
          </select>
        </div>
        <div className="w-full h-[90%] overflow-x-hidden overflow-y-auto">
          {filteredCategories.map((categoryGroup) => (
            <div key={categoryGroup.category} className="mt-4">
              <h4 className="text-lg font-semibold">
                {categoryGroup.category}
              </h4>
              <ul className="list-disc list-inside mt-2">
                {categoryGroup.reports.map((report) => (
                  <li key={report._id} className="text-gray-600">
                    {report.reason}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleDeletePost}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Delete Post
        </button>
        <button
          onClick={handleBlacklistUser}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Blacklist User
        </button>
      </div>

      {/* Conditionally render the custom confirmation modal */}
      {modalState.show && (
        <ConfirmModal
          message={
            modalState.type === "delete"
              ? "Are you sure you want to delete this post? This action cannot be undone."
              : "Are you sure you want to blacklist this user?"
          }
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default ReportCard;
