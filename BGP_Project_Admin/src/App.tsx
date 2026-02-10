import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Mainlayouts from "./Layout/Mainlayouts";
import Login from "./Auth/Login";

import PrivateRoute from "./Utils/PrivateRoute";

import AdminManageUsers from "./pages/AdminManageUsers";
import AdminManageSatpam from "./pages/AdminManageSatpam";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManageShift from "./pages/AdminManageShift";
import AdminManagePos from "./pages/AdminManagePos";
import AdminManagePosUtama from "./pages/AdminManagePosUtama";
import AdminRekapAbsensi from "./pages/AdminRekapAbsensi";
import AdminRekapPatroli from "./pages/AdminRekapPatroli";
import AdminManageRadius from "./pages/AdminManageRadius";
import AdminManageWaktuJadwal from "./pages/AdminManageWaktuJadwal";
function App() {
  return (
    <Router>
      <Routes>
        {/* ga ada sidebar sama navbarnya */}
        <Route path="/" element={<Login />} />

        <Route element={<PrivateRoute />}>
          {/* ada side bar sama navbarnya */}
          <Route element={<Mainlayouts />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/AdminManageSatpam" element={<AdminManageSatpam />} />
            <Route path="/AdminManageUsers" element={<AdminManageUsers />} />
            <Route path="/AdminManageShift" element={<AdminManageShift />} />
            <Route path="/AdminManagePos" element={<AdminManagePos />} />
            <Route
              path="/AdminManagePosUtama"
              element={<AdminManagePosUtama />}
            />
            <Route path="/AdminRekapAbsensi" element={<AdminRekapAbsensi />} />
            <Route path="/AdminRekapPatroli" element={<AdminRekapPatroli />} />
            <Route path="/AdminManageRadius" element={<AdminManageRadius />} />
            <Route
              path="/AdminManageWaktu"
              element={<AdminManageWaktuJadwal />}
            />
            {/* Buat selanjutnya ya */}
          </Route>
          {/* ada side bar sama navbarnya */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
