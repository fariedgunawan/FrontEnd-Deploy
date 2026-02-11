import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Divider } from "@heroui/react";
import { IoMdSettings, IoMdPhotos } from "react-icons/io";
import { GiPoliceOfficerHead } from "react-icons/gi";
import { GoClockFill } from "react-icons/go";
import {
  LuRadius,
  LuChevronLeft,
  LuChevronRight,
  LuScanFace,
} from "react-icons/lu";

import { MdCoPresent, MdOutlineLockClock } from "react-icons/md";
import {
  TbLogout,
  TbLayoutDashboardFilled,
  TbPhotoCheck,
} from "react-icons/tb";
import logo from "../assets/images/logo.png";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = document.cookie
    .split("; ")
    .find((row) => row.startsWith("role="))
    ?.split("=")[1];

  const menu = [
    {
      key: "dashboard",
      name: "Dashboard",
      icon: <TbLayoutDashboardFilled className="text-xl" />,
      path: "/AdminDashboard",
    },
    {
      key: "manage-satpam",
      name: "Manage Satpam",
      icon: <GiPoliceOfficerHead className="text-xl" />,
      path: "/AdminManageSatpam",
    },
    {
      key: "manage-admin",
      name: "Manage Client",
      icon: <IoMdSettings className="text-xl" />,
      path: "/AdminManageUsers",
      hidden: role !== "Admin",
    },
    {
      key: "manage-pos",
      name: "Manage Pos Patroli",
      icon: <TbPhotoCheck className="text-xl" />,
      path: "/AdminManagePos",
      hidden: role !== "Client",
    },
    {
      key: "manage-pos-utama",
      name: "Manage Pos Utama",
      icon: <MdCoPresent className="text-xl" />,
      path: "/AdminManagePosUtama",
      hidden: role !== "Client",
    },
    {
      key: "manage-waktu",
      name: "Manage Waktu",
      icon: <MdOutlineLockClock className="text-xl" />,
      path: "/AdminManageWaktu",
      hidden: role !== "Client",
    },
    {
      key: "manage-shift",
      name: "Manage Shift",
      icon: <GoClockFill className="text-xl" />,
      path: "/AdminManageShift",
      hidden: role !== "Client",
    },
    {
      key: "manage-radius",
      name: "Manage Radius",
      icon: <LuRadius className="text-xl" />,
      path: "/AdminManageRadius",
      hidden: role !== "Client",
    },
    {
      key: "download-absensi",
      name: "Download Absensi",
      icon: <LuScanFace className="text-xl" />,
      path: "/AdminRekapAbsensi",
    },
    {
      key: "download-patroli",
      name: "Download Patroli",
      icon: <IoMdPhotos className="text-xl" />,
      path: "/AdminRekapPatroli",
    },
  ];

  const filteredMenu = menu.filter((item) => !item.hidden);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  return (
    <div
      className={`
        h-screen bg-white border-r border-gray-100 flex flex-col shadow-xl shadow-blue-900/5 relative z-20 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[88px]" : "w-[280px]"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[50%] bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-sm hover:text-[#122C93] hover:border-[#122C93] transition-colors z-50"
      >
        {isCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
      </button>

      {/* --- Header Section --- */}
      <div
        className={`px-6 pt-8 pb-6 flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
      >
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div
          className={`flex flex-col overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100"
          }`}
        >
          <h1 className="text-lg font-bold text-[#122C93] tracking-tight leading-none whitespace-nowrap">
            PT. Bima Global
          </h1>
          <span className="text-[10px] text-gray-400 font-medium tracking-wider mt-1 uppercase whitespace-nowrap">
            Dashboard Admin
          </span>
        </div>
      </div>

      {/* --- Menu Section (Manual Implementation) --- */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
        {!isCollapsed && (
          <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-opacity duration-300">
            Main Menu
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`
                  group relative flex items-center w-full outline-none
                  py-3 px-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#122C93] text-white shadow-md shadow-blue-900/30"
                      : "bg-transparent text-gray-500 hover:bg-blue-50 hover:text-[#122C93]"
                  }
                  ${isCollapsed ? "justify-center" : "justify-start gap-2"}
                `}
              >
                {/* Icon Wrapper */}
                <div
                  className={`flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}
                >
                  <span className={`text-xl transition-colors duration-200`}>
                    {item.icon}
                  </span>
                </div>

                {/* Text Menu - Hide saat collapsed */}
                <span
                  className={`font-medium text-sm ml-2 whitespace-nowrap transition-all duration-200 ${
                    isCollapsed
                      ? "hidden opacity-0 w-0"
                      : "block opacity-100 w-auto"
                  }`}
                >
                  {item.name}
                </span>

                {/* Manual Tooltip (Only visible when collapsed + hover) */}
                {isCollapsed && (
                  <div
                    className="
                      absolute left-full ml-3 px-2 py-1.5 
                      bg-gray-800 text-white text-xs rounded-md 
                      opacity-0 group-hover:opacity-100 
                      pointer-events-none transition-opacity duration-200 z-50
                      whitespace-nowrap shadow-lg
                    "
                  >
                    {item.name}
                    {/* Panah kecil tooltip (opsional) */}
                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Footer Logout Section (Manual Implementation) --- */}
      <div className="p-4 mt-auto">
        <Divider className="mb-4" />

        <button
          onClick={handleLogout}
          className={`
            group relative flex items-center outline-none
            text-danger rounded-xl
            hover:bg-red-50 transition-colors duration-200
            ${isCollapsed ? "w-full h-12 justify-center" : "w-full h-12 px-4 justify-start gap-2"}
          `}
        >
          <TbLogout className="text-xl text-red-500" />

          {!isCollapsed && <span className="text-red-500">Keluar</span>}

          {/* Manual Tooltip untuk Logout */}
          {isCollapsed && (
            <div
              className="
                absolute left-full ml-3 px-2 py-1.5 
                bg-red-500 text-white text-xs rounded-md 
                opacity-0 group-hover:opacity-100 
                pointer-events-none transition-opacity duration-200 z-50
                whitespace-nowrap shadow-lg
              "
            >
              Keluar
              <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-red-500"></div>
            </div>
          )}
        </button>

        {!isCollapsed && (
          <div className="text-center mt-2 text-[10px] text-gray-300 whitespace-nowrap overflow-hidden">
            v1.0.0 &copy; 2026 Bima Global
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
