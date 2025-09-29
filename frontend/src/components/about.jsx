import aboutImage from '/dash-image.png';

const About = () => {
		return (
			<section className="py-6 xs:py-8 sm:py-12 md:py-16 lg:py-20 xl:py-28 bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<div className="max-w-[1800px] mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
				<div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-10 xl:gap-14 2xl:gap-16 items-start">
					<div className="order-2 lg:order-1 w-full space-y-6 xs:space-y-8 sm:space-y-10 md:space-y-12">
						<div className="group w-full">
							<div className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] w-full">
								<div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
								<div className="w-full" style={{ aspectRatio: '16/9' }}>
									<img 
										src={aboutImage} 
										alt="About Our Portal"
										className="w-full h-full object-contain"
									/>
								</div>
							</div>
						</div>
						
						<div className="group w-full">
							<div className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] w-full">
								<div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
								<div className="w-full" style={{ aspectRatio: '16/9' }}>
									<img 
										src={aboutImage} 
										alt="About Our Portal"
										className="w-full h-full object-contain"
									/>
								</div>
							</div>
						</div>
					</div>
					
					<div className="order-1 lg:order-2 flex flex-col justify-between">
						<div className="flex flex-col">
							<h2 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-5xl xl:text-6xl 2xl:text-7xl tracking-tight font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-7 xl:mb-8 leading-tight">
								Know Us Better
							</h2>
							<div className="space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-9 lg:space-y-6 xl:space-y-7 2xl:space-y-8">
								<div className="relative pl-5 border-l-4 border-yellow-500">
									<p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-base xl:text-lg 2xl:text-xl text-gray-700 leading-relaxed font-normal">
										Our integrated platform is engineered to revolutionize Tribal Land Governance under the Forest Rights Act (FRA), moving decisively beyond the historical paralysis of paper-based records to dynamic, data-driven action. The core innovation lies in the synergy of technology: we initiate the process by digitizing scattered, non-standardized legacy claims using Optical Character Recognition (OCR) and Named Entity Recognition (NER). This structured data then fuels the real-time, visual FRA Atlas on a WebGIS platform, which serves as a transparent and centralized repository.
									</p>
								</div>
								
								<div className="relative pl-5 border-l-4 border-yellow-500">
									<p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-base xl:text-lg 2xl:text-xl text-gray-700 leading-relaxed font-normal">
										The Atlas is fortified by AI-based asset mapping, where Computer Vision models analyze satellite imagery to precisely delineate resources—from water bodies and forest cover to cultivable land and barren tracts. This granular, verifiable land inventory is crucial for validating Individual and Community Forest Rights (IFR/CFR).
									</p>
								</div>
								
								<div className="relative pl-5 border-l-4 border-yellow-500">
									<p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-base xl:text-lg 2xl:text-xl text-gray-700 leading-relaxed font-normal">
										Most critically, this geographic intelligence powers the Decision Support System (DSS). The DSS employs rule-based and AI-enhanced logic to automatically cross-reference FRA patta holders and their associated geographical needs with the eligibility criteria of Central Sector Schemes (CSS), such as PM-KISAN, Jal Jeevan Mission, and DAJGUA. This process streamlines decision-making at the policy level, ensuring targeted, layered development is delivered efficiently, maximizing resource impact, and truly empowering forest-dwelling communities.
									</p>
								</div>
							</div>
						</div>
						
						<div className="mt-8 xs:mt-10 sm:mt-12 md:mt-14 lg:mt-10 xl:mt-12 pt-6 xs:pt-7 sm:pt-8 border-t-2 border-gray-200">
							<p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-800 tracking-tight font-semibold italic">
								Join us in technology adaptable for civil report.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About;