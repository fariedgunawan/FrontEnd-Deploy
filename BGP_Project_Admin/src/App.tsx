import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Mainlayouts from "./Layout/Mainlayouts";
import Login from "./Pages/Auth/Login";
import AdminManageSatpam from "./Pages/AdminManageSatpam";
import AdminManageAdmin from "./Pages/AdminManageAdmin";
import AdminManageShift from "./Pages/AdminManageShift";
import AdminManagePos from "./Pages/AdminManagePos";
import PrivateRoute from "./Pages/Utils/PrivateRoute";
import AdminDownloadRekap from "./Pages/AdminDownloadRekap";
import AdminManagePosUtama from "./Pages/AdminManagePosUtama";
import AdminManagePatroli from "./Pages/AdminManagePatroli";
import AdminManageRadius from "./Pages/AdminManageRadius";
function App() {
  return (
    <Router>
      <Routes>
        {/* ga ada sidebar sama navbarnya */}
        <Route path="/" element={<Login />} />

        <Route element={<PrivateRoute />}>
          {/* ada side bar sama navbarnya */}
          <Route element={<Mainlayouts />}>
            <Route path="/AdminManageSatpam" element={<AdminManageSatpam />} />
            <Route path="/AdminManageAdmin" element={<AdminManageAdmin />} />
            <Route path="/AdminManageShift" element={<AdminManageShift />} />
            <Route path="/AdminManagePos" element={<AdminManagePos />} />\
            <Route
              path="/AdminManagePosUtama"
              element={<AdminManagePosUtama />}
            />
            <Route
              path="/AdminManagePosPatroli"
              element={<AdminManagePatroli />}
            />
            <Route
              path="/AdminDownloadRekap"
              element={<AdminDownloadRekap />}
            />
            <Route path="/AdminManageRadius" element={<AdminManageRadius />} />
            {/* Buat selanjutnya ya */}
          </Route>
          {/* ada side bar sama navbarnya */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
