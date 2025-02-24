import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReportCard from "../components/partials/ReportCard";
import AdminPanelUserSection from "../components/AdminPanelUserSection";

const AdminPage = () => {
  const { theme } = useSelector((state) => state.theme);
  const [activeTab, setActiveTab] = useState("Reports");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/auth");
    } else {
      setPage(1);
      setReports([]);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "Reports") {
      fetchReports();
    }
  }, [page, activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/reports?page=${page}`);
      setReports((prevReports) => {
        const newReports = response.data.reports.filter(
          (newReport) =>
            !prevReports.some((report) => report._id === newReport._id)
        );
        return [...prevReports, ...newReports];
      });
      setHasMore(page * 5 < response.data.reportCount);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching reports");
      setLoading(false);
    }
  };

  const loadMoreReports = useCallback(() => {
    if (loading || !hasMore) return;
    setPage((prevPage) => prevPage + 1);
  }, [loading, hasMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (
        container.scrollTop + container.offsetHeight <
        container.scrollHeight - 100
      )
        return;
      loadMoreReports();
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMoreReports]);

  const blacklistUser = async (userId) => {
    try {
      await axios.post("/admin/blacklist-user", { userId });
      alert("User blacklisted successfully");
      setReports([]);
      setPage(1);
      fetchReports();
    } catch (error) {
      alert(error.response?.data?.message || "Error blacklisting user");
    }
  };

  const tabs = ["Reports", "Users"];

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen w-screen overflow-y-auto bg-[#EDEDED] text-[#161616] p-8"
    >
      {/* Navbar */}
      <nav className="mb-8">
        <div className="relative flex space-x-6">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // Reset page or content when switching tabs as needed
              }}
              className="relative cursor-pointer px-4 py-2"
            >
              <span className="relative z-10">{tab}</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#fff] rounded-md z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto rounded-lg p-6 bg-white">
        {activeTab === "Reports" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Admin Panel - Reports</h1>
            {reports.length === 0 ? (
              <p className="text-gray-600">No reports found</p>
            ) : (
              <div className="w-full flex items-start flex-wrap gap-4">
                {reports.map((reportGroup) => (
                  <ReportCard
                    key={reportGroup._id}
                    reportGroup={reportGroup}
                    blacklistUser={blacklistUser}
                    setReports={setReports}
                  />
                ))}
              </div>
            )}
            {loading && (
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
              </div>
            )}
          </>
        )}
        {activeTab === "Users" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Admin Panel - Users</h1>
            <AdminPanelUserSection />
          </>
        )}
      </div>

      <style jsx>{`
        .loader-container {
          --uib-size: 40px;
          --uib-color: ${theme === "dark" ? "#EDEDED" : "#191919"};
          --uib-speed: 2s;
          --uib-bg-opacity: 0;
          height: var(--uib-size);
          width: var(--uib-size);
          transform-origin: center;
          animation: rotate var(--uib-speed) linear infinite;
          overflow: visible;
        }

        .loader-car {
          fill: none;
          stroke: var(--uib-color);
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: stretch calc(var(--uib-speed) * 0.75) ease-in-out infinite;
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
  );
};

export default AdminPage;
