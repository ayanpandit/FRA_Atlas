import React from 'react';
import aboutImage from '../assets/about-person.jpg';

const About = () => {
	return (
		<section className="py-16 sm:py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
					<div className="order-2 lg:order-1">
						<img 
							src={aboutImage} 
							alt="About Our Portal"
							className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
						/>
					</div>
					<div className="order-1 lg:order-2">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
							About Our Portal
						</h2>
						<p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
							Our portal is designed to revolutionize forest land management and 
							change land and land rights. From bottom-up entity level, policy level, and 
							analysis level, our tools facilitate efficient planning procedures and ensure 
							development land inventory, streamlining decision-making for effective natural 
							resource management.
						</p>
						<p className="text-base sm:text-lg text-gray-600 leading-relaxed">
							Join us in technology adaptable for civil report.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About;
