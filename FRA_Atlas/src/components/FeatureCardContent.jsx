import { useState } from 'react';

/**
 * FeatureCardContent
 * Props:
 * - image: image src
 * - title: string
 * - description: string
 * - icon: JSX
 */
const FeatureCardContent = ({ image, title, description, icon }) => {
  const [showImage, setShowImage] = useState(false);

  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      className="flex flex-col items-center justify-center p-8 w-full h-full"
      onMouseEnter={() => setShowImage(true)}
      onMouseLeave={() => setShowImage(false)}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/20 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 z-10">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-center z-10">{description}</p>
      {/* Image reveal on hover */}
      <img
        src={image}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover rounded-[25px] transition-opacity duration-700 z-0 ${showImage ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: 'none' }}
      />
      {/* Overlay for fade effect */}
      <div className={`absolute inset-0 rounded-[25px] bg-black/60 transition-opacity duration-700 z-0 ${showImage ? 'opacity-0' : 'opacity-100'}`}></div>
    </div>
  );
};

export default FeatureCardContent;
