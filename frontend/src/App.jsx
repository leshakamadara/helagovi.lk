
import React from "react";
import { Route, Routes } from "react-router-dom";
import Page from "./app/dashboard/page.jsx";
import UserSupportPage from "./pages/support/UserSupportPage.jsx";
import SupportDashboard from "./pages/support/SupportDashboard.jsx"

const App = () => {
	return (
		<div className="relative h-screen w-screen">
			{/* Background gradient */}
			<div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />
			
      <Routes>
				<Route path="/dashboard" element={<Page />} />
        
        <Route path="/usersupport" element={<UserSupportPage />} />

         <Route path="/supportdashboard" element={<SupportDashboard />} />

        	
			</Routes>
		</div>
	);
};

export default App;
