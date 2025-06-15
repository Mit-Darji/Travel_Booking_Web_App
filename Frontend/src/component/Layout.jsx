import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Offers from "./Offers";
import InsuranceCarousel from "./InsuranceCarousel";
import Login from "./Login";
import DisplayHolidayPackage from "./DisplayHolidayPackage";
import PercentageOffer from "./PercentageOffer";
const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-indigo-50 via-white to-blue-50 px-50 py-4 min-h-screen">
        <Routes>
          <Route path="/" element={
            <>
              <Offers />
              <InsuranceCarousel />
              <PercentageOffer/>
            </>
          } />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
};

export default Layout;