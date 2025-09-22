import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-700">
          Helagovi.lk
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700">
          <Link to="/marketplace" className="hover:text-green-600">Marketplace</Link>
          <Link to="/about" className="hover:text-green-600">About</Link>
          <Link to="/contact" className="hover:text-green-600">Contact</Link>
          <Link to="/support" className="hover:text-green-600">Support</Link>
        </nav>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
            <div className="flex flex-col space-y-4 mt-6">
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/support">Support</Link>
              <Button asChild><Link to="/signup">Sign Up</Link></Button>
              <Button variant="outline" asChild><Link to="/login">Login</Link></Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
