import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { RiArrowLeftLine, RiCloseLine } from "@remixicon/react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../redux/actions/postAction";
import { loadUser } from "../redux/reducers/userSlice";

function UploadPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [blobUrls, setBlobUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const categoriesArray = user?.categories;
  useEffect(() => {
    loadUser();
  }, [user, dispatch]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, video/*",
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (files.length + acceptedFiles.length > 5) {
        setError("Maximum 5 files allowed");
        return;
      }

      const newBlobUrls = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setBlobUrls((prev) => [...prev, ...newBlobUrls]);

      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file, index) =>
          Object.assign(file, {
            preview: newBlobUrls[index],
          })
        ),
      ]);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please fill out the title");
      return;
    }

    if (!content.trim()) {
      setError("Please fill out the content");
      return;
    }

    setError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("textContent", content);
    // Append the selected category
    const selectedCategory = document.getElementById("category").value;
    formData.append("category", selectedCategory);

    // Handle multiple files
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        if (file.type.startsWith("image/")) {
          formData.append("image", file); // Append each image with the same field name
        } else if (file.type.startsWith("video/")) {
          formData.append("video", file);
        }
      });
    }

    try {
      await dispatch(createPost(formData, navigate));
    } catch (error) {
      setError("Oops... A problem occurred while posting.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));

    // Remove the corresponding blob URL
    URL.revokeObjectURL(blobUrls[indexToRemove]);
    setBlobUrls(blobUrls.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    return () => {
      // Cleanup blob URLs when component unmounts
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  return (
    <div className="overflow-auto flex items-center justify-center w-screen min-h-screen bg-gray-100 dark:bg-[#191919] py-4 md:py-8">
      <RiArrowLeftLine
        size={40}
        className="hidden sm:block text-black opacity-50 hover:opacity-100 dark:text-[#EDEDED] fixed left-0 top-0 mt-5 ml-5"
        onClick={goBack}
      />
      <div className="h-fit bg-white dark:bg-zinc-800 p-4 md:p-8 rounded-lg shadow-lg w-full sm:w-[60%] mx-2 md:mx-0">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-[#EDEDED] mb-4">
              Upload Post
            </h2>
            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-gray-600 dark:text-zinc-300 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-[#161616] rounded-md outline-none focus:border-[#EA516F] text-black dark:text-white dark:bg-[#161616]"
                required
              />
            </div>
            {/* Content Input */}
            <div className="mb-4">
              <label className="block text-gray-600 dark:text-zinc-300 mb-1">
                Content
              </label>
              <textarea
                type="text"
                placeholder="Spill the tea.."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[10rem] resize-none p-2 border border-[#161616] rounded-md outline-none focus:border-[#EA516F] text-black dark:text-white dark:bg-[#161616]"
                required
              />
            </div>
            {/* Category Menu */}
            <div className="mb-4">
              <label className="inline mr-5 text-gray-600 dark:text-zinc-300 mb-1">
                Category (Optional):
              </label>
              <select
                className="px-3 py-2 text-sm dark:bg-[#161616] dark:text-[#EDEDED]"
                name="catgory"
                id="category"
              >
                <option value="">General/All</option>
                {categoriesArray?.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
                {/* <option value={} ></option> */}
              </select>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            {/* File Dropzone */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-md p-10 mb-4 text-center cursor-pointer"
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">
                Drag and Drop here or{" "}
                <span className="text-[#EA516F] underline">Browse files</span>
              </p>
              <p className="text-sm text-gray-400">
                Accepted File Types: .jpg, .png, .mp4 only
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {files.length}/5 files uploaded
              </p>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-gray-600 dark:text-zinc-300">
                  Selected Files:
                </h4>
                <div className="max-h-[30vh] overflow-y-auto">
                  <div className="flex flex-wrap h-full gap-2 mt-2 overflow-x-auto p-2">
                    {files.map((file, index) => (
                      <div key={file.path} className="w-28 h-28 relative">
                        {file?.type?.startsWith("image") ? (
                          <div className="w-full h-full relative">
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="object-cover w-full h-full rounded-md"
                            />
                            <div
                              className="absolute w-5 h-5 translate-x-1/2 -translate-y-1/2 right-1 top-1 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <RiCloseLine color="#EFEFEF" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <video
                              src={file.preview}
                              className="object-cover w-full h-full rounded-md"
                              controls
                            />
                            <div
                              className="absolute w-5 h-5 translate-x-1/2 -translate-y-1/2 right-1 top-1 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <RiCloseLine color="#EFEFEF" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <h3 className="text-[#EA516F] absolute bottom-0 left-1/2 translate-x-[-50%]">
              {error}
            </h3>
          </div>
        </div>
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-[100%] md:w-[50%] mt-4 bg-[#EA516F] text-white py-2 rounded-md hover:bg-[#EA516F] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default UploadPostPage;
