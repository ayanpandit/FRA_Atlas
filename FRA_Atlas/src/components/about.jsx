import aboutImage from '/dash-image.png';

const About = () => {
		return (
			<section className="py-8 sm:py-28">
			<div className="max-w-[1800px] mx-auto px-2 sm:px-16">
				<div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4 lg:gap-6 items-center">
					<div className="order-2 lg:order-1">
						<img 
							src={aboutImage} 
							alt="About Our Portal"
							className="w-full h-72 sm:h-[28rem] lg:h-[38rem] object-cover rounded-lg shadow-lg"
						/>
					</div>
					<div className="order-1 lg:order-2 flex flex-col h-full min-h-[22rem]">
						<h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight font-bold text-gray-800 mb-4 sm:mb-6">
							Know Us Better
						</h2>
						<p className="text-base text-gray-600 leading-tight font-semibold mb-4">
							Our integrated platform is engineered to revolutionize Tribal Land Governance under the Forest Rights Act (FRA), moving decisively beyond the historical paralysis of paper-based records to dynamic, data-driven action. The core innovation lies in the synergy of technology: we initiate the process by digitizing scattered, non-standardized legacy claims using Optical Character Recognition (OCR) and Named Entity Recognition (NER). This structured data then fuels the real-time, visual FRA Atlas on a WebGIS platform, which serves as a transparent and centralized repository.

							<br />
							<br />

							The Atlas is fortified by AI-based asset mapping, where Computer Vision models analyze satellite imagery to precisely delineate resources—from water bodies and forest cover to cultivable land and barren tracts. This granular, verifiable land inventory is crucial for validating Individual and Community Forest Rights (IFR/CFR).

							<br />
							<br />

							Most critically, this geographic intelligence powers the Decision Support System (DSS). The DSS employs rule-based and AI-enhanced logic to automatically cross-reference FRA patta holders and their associated geographical needs with the eligibility criteria of Central Sector Schemes (CSS), such as PM-KISAN, Jal Jeevan Mission, and DAJGUA. This process streamlines decision-making at the policy level, ensuring targeted, layered development is delivered efficiently, maximizing resource impact, and truly empowering forest-dwelling communities.
						</p>
						<p className="text-base sm:text-lg text-gray-600 tracking-tight mt-auto">
							Join us in technology adaptable for civil report.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About;
