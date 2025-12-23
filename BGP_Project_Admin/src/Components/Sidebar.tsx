import { Link, useLocation } from "react-router-dom";
import { IoPersonAdd } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { AiFillHome } from "react-icons/ai";
import { GoClockFill } from "react-icons/go";
import {
  MdFileDownload,
  MdCoPresent,
  MdOutlineManageHistory,
} from "react-icons/md";
import { TbLogout } from "react-icons/tb";

const Sidebar = () => {
  const location = useLocation();

  const role = document.cookie
    .split("; ")
    .find((row) => row.startsWith("role="))
    ?.split("=")[1];

  const menu = [
    {
      name: "Manage Satpam",
      icon: <IoPersonAdd />,
      path: "/AdminManageSatpam",
    },
    {
      name: "Manage Admin",
      icon: <IoMdSettings />,
      path: role === "SuperAdmin" ? "/AdminManageAdmin" : "#",
      disabled: role !== "SuperAdmin",
    },
    { name: "Manage Pos Patroli", icon: <AiFillHome />, path: "/AdminManagePos" },
    {
      name: "Manage Pos Utama",
      icon: <MdCoPresent />,
      path: "/AdminManagePosUtama",
    },
    { name: "Manage Shift", icon: <GoClockFill />, path: "/AdminManageShift" },
    {
      name: "Manage Patroli",
      icon: <MdOutlineManageHistory />,
      path: "/AdminManagePosPatroli",
    },
    {
      name: "Download Rekap",
      icon: <MdFileDownload />,
      path: "/AdminDownloadRekap",
    },
  ];

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  return (
    <div className="side-bar-section bg-[#FFFFFF] w-[300px] h-screen flex flex-col justify-between p-4">
      <div>
        <h1 className="text-[23px] font-bold text-[#122C93] text-center py-5">
          PT. Bima Global
        </h1>
        <ul className="text-start text-[#122C93] text-[18px] space-y-2 mt-5 font-medium">
          {menu.map((item) => (
            <li key={item.name}>
              <Link
                to={item.disabled ? "#" : item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-50"
                } ${
                  location.pathname === item.path
                    ? "bg-blue-100 font-medium"
                    : ""
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-600 px-4 py-3 hover:bg-red-50 hover:rounded-xl"
      >
        <TbLogout size={18} />
        Keluar
      </button>
    </div>
  );
};

export default Sidebar;
