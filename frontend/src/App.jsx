import React from "react";
import { Route, Routes } from "react-router-dom";

// Test page
const HomePage = () => (
  <div className="p-10 text-center text-white">
    🟢 Frontend is working!
  </div>
);

const App = () => {
  return (
    <div className="relative h-screen w-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default App;
