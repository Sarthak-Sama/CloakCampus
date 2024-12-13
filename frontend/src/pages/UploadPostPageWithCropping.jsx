import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage"; // Utility function to crop image
import { RiArrowLeftLine, RiCloseLine, RiPencilFill } from "@remixicon/react";
import { useDispatch } from "react-redux";
import { createPost } from "../redux/actions/postAction";

function UploadPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // New state for text content
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [blobUrls, setBlobUrls] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, video/*",
    multiple: true,
    onDrop: (acceptedFiles) => {
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

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(
      selectedImage.preview,
      croppedAreaPixels
    );

    // Create new blob URL for cropped image
    const newBlobUrl = URL.createObjectURL(croppedImage);
    setBlobUrls((prev) => [...prev, newBlobUrl]);

    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.preview === selectedImage.preview
          ? { ...file, preview: newBlobUrl }
          : file
      )
    );
    setIsCropModalOpen(false);
    setSelectedImage(null);
  };

  const handleCropClick = (file) => {
    console.log("Selected file for crop:", file);
    console.log("File preview URL:", file.preview);
    setSelectedImage(file);
    setIsCropModalOpen(true);
  };

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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("textContent", content);

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
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  React.useEffect(() => {
    return () => {
      // Cleanup blob URLs when component unmounts
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  return (
    <div className="flex justify-center items-center w-screen min-h-screen bg-gray-100">
      <RiArrowLeftLine
        size={40}
        className="text-zinc-500 hover:text-black absolute left-0 top-0 mt-5 ml-5"
        onClick={goBack}
      />
      <div className="bg-white p-8 rounded-lg shadow-lg w-[70%] flex gap-5">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Upload Post
          </h2>

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md outline-none focus:border-[#EA516F]"
              required
            />
          </div>
          {/* Content Input */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Content</label>
            <textarea
              type="text"
              placeholder="Spill the tea.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[10rem] resize-none p-2 border rounded-md outline-none focus:border-[#EA516F]"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-[#EA516F] text-white py-2 rounded-md hover:bg-[#EA516F] transition"
          >
            Upload
          </button>
        </div>
        <div className="w-1/2 relative">
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
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-gray-600">Selected Files:</h4>
              <div className="max-h-[30vh] overflow-y-auto">
                <div className="flex flex-wrap h-full gap-2 mt-2 overflow-x-auto p-2">
                  {files.map((file) => (
                    <div key={file.path} className="w-28 h-28 relative">
                      {file?.type?.startsWith("image") ? ( // Check if file and type exist
                        <div
                          className="w-full h-full relative group"
                          onClick={() => handleCropClick(file)}
                        >
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="object-cover w-full h-full rounded-md cursor-pointer absolute"
                          />
                          <div className="w-full h-full flex items-center justify-center bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 absolute rounded-md">
                            <RiPencilFill color="white" />
                          </div>
                          <div className="absolute w-5 h-5 translate-x-1/2 -translate-y-1/2 right-1 top-1 rounded-full bg-red-500 flex items-center justify-center">
                            <RiCloseLine color="#EFEFEF" />
                          </div>
                        </div>
                      ) : (
                        <video
                          src={file.preview}
                          className="object-cover w-full h-full rounded-md"
                          controls
                        />
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

          {/* Crop Modal */}
          {isCropModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Crop Image
                </h3>
                <div className="relative w-full h-64 bg-gray-200">
                  <Cropper
                    image={selectedImage?.preview || ""}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                </div>
                <h5 className="hidden lg:block my-2 text-sm text-center text-zinc-400 uppercase font-[900]">
                  Scroll to Zoom
                </h5>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => setIsCropModalOpen(false)}
                    className="bg-gray-400 text-white py-1 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="bg-[#EA516F] text-white py-1 px-4 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPostPage;
