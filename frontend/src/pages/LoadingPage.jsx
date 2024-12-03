import React from "react";
import { motion } from "framer-motion";

function LoadingPage() {
  return (
    <div className="w-screen h-screen bg-[#13070F] relative">
      <video
        className="h-[100vh] absolute right-0"
        src="media/loadingGIF.mp4"
        autoPlay
        muted
        loop
      ></video>
      <h1 className="md:block hidden font-['shrimp'] absolute bottom-0 text-4xl text-[#FEFFFE] mb-5 ml-5">
        loading...
      </h1>
      <motion.div
        className="absolute"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          height: "10px",
          backgroundColor: "#FEFFFE",
        }}
      />
    </div>
  );
}

export default LoadingPage;
