import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./component/Layout";
import VendorDashboard from "./component/VendorDashboard";
import VendorSetupForm from "./component/VendorSetupForm";
import SearchResult from "./component/SearchResult";
import SearchHotel from "./component/SearchHotel";
import PackageDetail from "./component/PackageDetail";
import HotelDetail from "./component/HotelDetail";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/*" element={<Layout />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/vendor-setup" element={<VendorSetupForm />} />
        <Route path="/search-packages" element={<SearchResult />} />
        <Route path="/search-hotels" element={<SearchHotel />} />
        <Route path="/package/:id" element={<PackageDetail />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
      </Routes>
    </Router>
  );
}

export default App;