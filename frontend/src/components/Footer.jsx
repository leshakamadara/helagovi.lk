export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-10">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-gray-600">
        
        {/* Left - Branding */}
        <p className="text-sm">
          © {new Date().getFullYear()} <span className="font-semibold">Helagovi.lk</span>. All rights reserved.
        </p>

        {/* Right - Links */}
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/privacy" className="hover:text-green-600">Privacy Policy</a>
          <a href="/terms" className="hover:text-green-600">Terms</a>
          <a href="/contact" className="hover:text-green-600">Contact</a>
        </div>
      </div>
    </footer>
  )
}
