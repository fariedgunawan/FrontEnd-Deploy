import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardCard } from "../Components/dashboard/DashboardCard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, greeting, filteredMenuItems } = useDashboard();

  return (
    <div className="flex flex-col p-6 min-h-[87vh] bg-gray-50/50">
      <div className="flex flex-col gap-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-[#122C93]">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {greeting}, {user?.nama || "User"}. Silakan pilih menu di bawah ini.
          </p>
        </div>

        {/* MENU UTAMA GRID */}
        <div>
          <h3 className="text-xl font-semibold text-[#122C93] mb-6">
            Menu Utama
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenuItems.map((item, index) => (
              <DashboardCard key={index} item={item} onClick={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
