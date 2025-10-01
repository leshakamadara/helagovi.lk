import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-green-50">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center">
            <img 
              src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png" 
              alt="Helagovi.lk Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="ml-2 text-xl font-bold text-gray-800">Helagovi.lk</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden md:block">
        <img
          src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759263222/banner_gypb09.png"
          alt="Helagovi.lk Banner"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-12">
          <div 
            className="font-black tracking-[-4%] text-transparent bg-clip-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-center pb-2 px-4"
            style={{
              background: 'radial-gradient(circle, #34E89E 0%, #45A21A 50%, #005B26 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ceylon's Farming Network
          </div>
          <img
            src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
            alt="Helagovi.lk Logo"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain"
          />
        </div>
      </div>
    </div>
  )
}