import asyncio
import asyncpg
import os
from dotenv import load_dotenv

print("--- Script execution started ---") # Keep this for initial check

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://fra_user:Jaadu21@localhost/fra_db")

async def test_connection():
    print(f"--- DEBUG: asyncpg test using URL: '{DATABASE_URL}'")

    # IMPORTANT: Remove 'postgresql+asyncpg://' prefix as asyncpg expects 'postgresql://' or no prefix
    # And handle the case where the password contains special characters by proper URL encoding
    # However, for asyncpg.connect, it's often better to pass components or use a proper URL format.

    # Let's try passing the components directly if parsing is tricky.
    # The asyncpg.connect function can take individual parameters.

    # Re-extract components using a more robust approach, or just direct assignment:
    # Based on your URL: postgresql+asyncpg://fra_user:Jaadu@21@localhost/fra_db
    # It seems your password is "Jaadu@21"
    # This URL format is already a bit tricky with an '@' in the password.

    # Let's try to make the DATABASE_URL compatible with asyncpg or split explicitly.
    # The asyncpg.connect function directly takes parameters.
    # It might be safer to define these in the .env directly if the URL parsing is problematic.

    try:
        # Option 1: Try asyncpg.connect() with the full URL (it often handles 'postgresql+asyncpg' internally)
        # However, the +asyncpg dialect part is for SQLAlchemy, asyncpg itself expects postgresql://
        # Let's strip the +asyncpg
        clean_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        conn = await asyncpg.connect(clean_url)
        print("--- asyncpg connection successful with clean_url! ---")
        await conn.close()
        return # Exit if successful

    except Exception as e:
        print(f"--- asyncpg connection FAILED with clean_url: {e} ---")
        print("--- Attempting manual parameter parsing as a fallback ---")
        # Fallback to manual parameter parsing, being careful with the password containing '@'
        try:
            # Assuming format: scheme://user:password@host:port/database
            # We need to be careful with the password part if it contains '@'

            # A more robust way to parse a URL:
            from urllib.parse import urlparse, quote_plus

            parsed_url = urlparse(DATABASE_URL)

            user = parsed_url.username
            password = parsed_url.password
            host = parsed_url.hostname
            port = parsed_url.port
            database = parsed_url.path.lstrip('/')

            # If your password has special chars, it might need to be URL-encoded for the URL string,
            # but when passed as a direct parameter to asyncpg.connect, it usually doesn't.
            print(f"Parsed - User: {user}, Host: {host}, Port: {port}, DB: {database}, Password length: {len(password) if password else 0}")
            print(f"  Password (first 2 chars): {password[:2] if password else 'N/A'}, Last 2 chars: {password[-2:] if password else 'N/A'}")


            conn = await asyncpg.connect(
                user=user,
                password=password,
                host=host,
                port=port,
                database=database
            )
            print("--- asyncpg connection successful with manual parameters! ---")
            await conn.close()

        except Exception as e:
            print(f"--- asyncpg connection FAILED with manual parameters: {e} ---")


if __name__ == "__main__":
    asyncio.run(test_connection())