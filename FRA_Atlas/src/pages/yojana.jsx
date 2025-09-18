import React from 'react';

const Yojana = () => {
  const schemes = [
    {
      name: "PM-Kisan Samman Nidhi",
      image: "/assets/image1.jpg"
    },
    {
      name: "Jal Jeevan Mission",
      image: "/assets/image2.jpg"
    },
    {
      name: "PM Awas Yojana",
      image: "/assets/image3.jpg"
    },
    {
      name: "Forest Rights Act",
      image: "/assets/image4.jpg"
    },
    {
      name: "MGNREGA",
      image: "/assets/image5.jpg"
    },
    {
      name: "Rural Development Schemes",
      image: "/assets/image6.jpg"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Recommended Yojanas
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {schemes.map((scheme, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-400">
              <img 
                src={scheme.image} 
                alt={scheme.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 bg-yellow-400">
                <h3 className="text-lg font-semibold text-black text-center">
                  {scheme.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Yojana;