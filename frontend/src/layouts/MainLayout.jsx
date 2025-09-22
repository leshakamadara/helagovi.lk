import React from "react"
import Navbar from "@/components/Navbar.jsx"
import Footer from "@/components/Footer.jsx"

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar at top */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer at bottom */}
      <Footer />
    </div>
  )
}

export default MainLayout
