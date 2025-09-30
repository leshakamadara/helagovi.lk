export default function Footer() {
  return (
    <footer className="py-4 md:py-8 space-y-4 border-t bg-gray-50 mt-10">
      {/* Mobile Layout */}
      <div className="container mx-auto px-4 md:hidden">
        <div className="flex flex-col items-center space-y-1 text-center">
          {/* Logo */}
          <img
            src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
            alt="Helagovi.lk Logo"
            className="h-12 w-12 object-contain"
          />

          {/* Brand Name Heading */}
          <h2 className="text-lg font-bold text-gray-800">
            Helagovi.lk
          </h2>

          {/* Project Info */}
          <p className="text-sm font-bold text-gray-500">
            Batch 8 Group 190 IT Project {new Date().getFullYear()}
          </p>

          {/* Links as Bold Subheadings */}
          <div className="flex flex-col space-y-2 pt-4">
            <a href="/privacy" className="font-medium text-gray-700 hover:text-green-600">Privacy Policy</a>
            <a href="/terms" className="font-medium text-gray-700 hover:text-green-600">Terms</a>
            <a href="/contact" className="font-medium text-gray-700 hover:text-green-600">Contact</a>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="container mx-auto px-4 hidden md:flex md:flex-row justify-between items-center text-gray-600">
        {/* Left - Branding with Logo */}
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
            alt="Helagovi.lk Logo"
            className="h-8 w-8 object-contain"
          />
          <p className="text-base">
            <span className="font-semibold">Helagovi.lk</span> | <span className="font-bold text-gray-500">Batch 8 Group 190 IT Project {new Date().getFullYear()}</span>
          </p>
        </div>

        {/* Right - Links */}
        <div className="flex gap-6">
          <a href="/privacy" className="font-bold text-gray-600 hover:text-green-600">Privacy Policy</a>
          <a href="/terms" className="font-bold text-gray-600 hover:text-green-600">Terms</a>
          <a href="/contact" className="font-bold text-gray-600 hover:text-green-600">Contact</a>
        </div>
      </div>
    </footer>
  )
}
