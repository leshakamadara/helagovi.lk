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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-8 px-4 py-8">
          <div 
            className="font-black tracking-[-4%] text-transparent bg-clip-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-center pb-2 px-4 max-w-full break-words hyphens-auto leading-tight flex-shrink-0"
            style={{
              background: 'radial-gradient(circle, #34E89E 0%, #45A21A 50%, #005B26 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ceylon's Farming Network
          </div>
          <div className="flex-shrink-0 mt-2">
            <img
              src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
              alt="Helagovi.lk Logo"
              className="w-80 h-80 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}