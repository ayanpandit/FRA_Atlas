import ee

# -------------------------------
# Initialize Earth Engine with your project
EE_PROJECT_ID = "fra-a-472418"  # Replace with your actual project ID
ee.Initialize(project=EE_PROJECT_ID)
print("✅ Earth Engine initialized.")

# -------------------------------
# Input coordinates and radius
lat_lon = input("Enter latitude and longitude separated by comma (e.g., 25.76177,84.15032): ")
lat, lon = [float(x.strip()) for x in lat_lon.split(",")]
radius_m = max(10, float(input("Enter radius in meters (>=10 m): ")))

# Define AOI: circular buffer around point
point = ee.Geometry.Point([lon, lat])
aoi = point.buffer(radius_m)
print(f"✅ AOI created as circular area with radius {radius_m} m around point ({lat}, {lon})")

# -------------------------------
# Load WorldPop population dataset (100m resolution)
population_img = ee.Image("WorldPop/GP/100m/pop").select("population")

# Clip to AOI
pop_clipped = population_img.clip(aoi)

# -------------------------------
# Calculate total population
pop_stats = pop_clipped.reduceRegion(
    reducer=ee.Reducer.sum(),
    geometry=aoi,
    scale=100,      # WorldPop resolution is 100m
    maxPixels=1e9
)

# Get the population value
total_population = pop_stats.get("population").getInfo()

# -------------------------------
# Print results
print(f"📊 Estimated population within {radius_m} meters: {int(total_population)} people")
