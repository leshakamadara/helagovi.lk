import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
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
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759263222/banner_gypb09.png"
          alt="Helagovi.lk Banner"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 md:gap-12">
          <div 
            className="font-black tracking-[-4%] text-transparent bg-clip-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-center pb-2"
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
            className="w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain"
          />
        </div>
      </div>
    </div>
  )
}