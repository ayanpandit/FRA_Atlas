# database.py
import os
from dotenv import load_dotenv

from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from geoalchemy2 import Geometry # Crucial for spatial data
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.sql.expression import select

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Get database URL from environment variable
# Using asyncpg driver for async SQLAlchemy operations with FastAPI
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://fra_user:Jaadu21@localhost/fra_db")
print(f"--- DEBUG: Python attempting to connect with URL: '{DATABASE_URL}'")
# IMPORTANT: Replace 'your_secure_password' with the password you set!
# For Docker, this would be 'postgresql+asyncpg://fra_user:your_secure_password@db/fra_db' (where 'db' is the service name)

# --- SQLAlchemy Setup ---
Base = declarative_base() # Base class for our declarative models

# Async engine for use with FastAPI's async operations
async_engine = create_async_engine(DATABASE_URL, echo=True) # echo=True for logging SQL queries (useful for debugging)

# Async session for database interactions
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False # Good practice for async
)

# Dependency for FastAPI to get a database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# --- Database Models ---
# (These represent your database tables)

class Village(Base):
    __tablename__ = "villages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    population = Column(Integer, nullable=True)
    # GeoAlchemy2 Geometry column for village boundaries
    # MULTIPOLYGON for complex boundaries, SRID 4326 for WGS84 (Lat/Lon)
    geometry = Column(Geometry(geometry_type='MULTIPOLYGON', srid=4326), nullable=True)

    # Relationships to other tables
    fra_claims = relationship("FRAClaim", back_populates="village")
    assets = relationship("Asset", back_populates="village")

    def _repr_(self):
        return f"<Village(id={self.id}, name='{self.name}', district='{self.district}')>"

class FRAClaim(Base):
    __tablename__ = "fra_claims"
    id = Column(Integer, primary_key=True, index=True)
    holder_name = Column(String, index=True, nullable=False)
    claim_id = Column(String, unique=True, nullable=False)
    status = Column(String, nullable=False) # e.g., 'Granted', 'Pending', 'Rejected'
    claim_date = Column(Date, nullable=True)
    granted_date = Column(Date, nullable=True)
    document_path = Column(String, nullable=True) # Path to original digitized document

    # Foreign key to the villages table
    village_id = Column(Integer, ForeignKey('villages.id'), nullable=False)
    village = relationship("Village", back_populates="fra_claims")

    # Geometry column for the actual patta (land title) area
    # POLYGON for individual land parcels, SRID 4326
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=True)

    def _repr_(self):
        return f"<FRAClaim(id={self.id}, holder='{self.holder_name}', claim_id='{self.claim_id}')>"

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # e.g., 'Agricultural Land', 'Water Body', 'Homestead', 'Forest Cover'
    subtype = Column(String, nullable=True) # e.g., 'Pond', 'River', 'Crop Field'
    area_sqm = Column(Integer, nullable=True) # Calculated area from geometry
    description = Column(String, nullable=True)

    # Foreign key to the villages table
    village_id = Column(Integer, ForeignKey('villages.id'), nullable=False)
    village = relationship("Village", back_populates="assets")

    # Geometry column for the asset's spatial extent
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False) # Must have geometry

    def _repr_(self):
        return f"<Asset(id={self.id}, type='{self.type}', village_id={self.village_id}')>"

class Scheme(Base):
    __tablename__ = "schemes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    eligibility_criteria = Column(String, nullable=True) # Textual description of criteria
    ministry = Column(String, nullable=True) # E.g., 'Ministry of Rural Development'

    def _repr_(self):
        return f"<Scheme(id={self.id}, name='{self.name}')>"

# --- Database Initialization Function ---
async def init_db():
    """Creates all tables defined in Base.metadata."""
    async with async_engine.begin() as conn:
        # This will create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created/checked.")

# --- Example Usage (for testing if tables are created) ---
# You would typically call init_db() on your FastAPI app's startup event.
# For a quick manual test:
async def main_db_test():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Example: Add a village if it doesn't exist
        existing_village = (await session.execute(select(Village).where(Village.name == "TestVillage"))).scalar_one_or_none()
        if not existing_village:
            new_village = Village(name="TestVillage", district="TestDistrict", state="TestState", population=1000)
            session.add(new_village)
            await session.commit()
            print(f"Added {new_village}")
        else:
            print(f"Village {existing_village.name} already exists.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main_db_test())