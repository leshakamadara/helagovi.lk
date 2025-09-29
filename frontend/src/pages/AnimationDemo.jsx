import Lottie from 'lottie-react';
import animationData from '../assets/Logo-1-[remix]-2.json';

const AnimationDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Lottie Animation Demo</h1>
        <div className="flex justify-center">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
            <Lottie
              animationData={animationData}
              loop
              autoplay
              background="transparent"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;