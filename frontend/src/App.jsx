import React from "react";
import { Route, Routes } from "react-router";

// Test page
const TestPage = () => <div className="p-10 text-center">Frontend is working!</div>;

const App = () => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        <Route path="/" element={<TestPage />} />
      </Routes>
    </div>
  );
};

export default App;
