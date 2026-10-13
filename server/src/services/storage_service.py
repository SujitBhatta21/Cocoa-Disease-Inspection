"""
Service for Azure Storage
"""
import os
import uuid
import logging
import mimetypes
from urllib.parse import unquote, urlparse
from azure.identity import ManagedIdentityCredential, DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from azure.core.pipeline.policies import UserAgentPolicy
from azure.core.exceptions import ResourceExistsError

from fastapi import HTTPException
from pathlib import Path


# Create your credential you want to use
mi_credential = ManagedIdentityCredential()
def_credential = DefaultAzureCredential()

# Try to make it org_name-org_id as the container name. If it doesn't exist create one else append.
STORAGE_ACCOUNT_NAME = os.getenv("STORAGE_ACCOUNT_NAME")

account_url = f"https://{STORAGE_ACCOUNT_NAME}.blob.core.windows.net"

logger = logging.getLogger("uvicorn.error")

# Set up user-agent override
class NoUserAgentPolicy(UserAgentPolicy):
    def on_request(self, request):
        pass

# Create the BlobServiceClient object
blob_service_client = BlobServiceClient(account_url, credential=def_credential, user_agent_policy=NoUserAgentPolicy())


def get_storage_account_url():
    return account_url


def download_blob_image(blob_url: str) -> tuple[bytes, str]:
    """Download an image from this application's configured storage account."""
    parsed_url = urlparse(blob_url)
    expected_host = urlparse(account_url).netloc
    path = unquote(parsed_url.path.lstrip("/"))
    container_name, separator, blob_name = path.partition("/")

    if (
        parsed_url.scheme != "https"
        or parsed_url.netloc != expected_host
        or not separator
        or not container_name
        or not blob_name
    ):
        raise ValueError("Invalid Blob Storage image URL")

    blob_client = blob_service_client.get_blob_client(
        container=container_name,
        blob=blob_name,
    )
    image_bytes = blob_client.download_blob().readall()
    content_type = mimetypes.guess_type(blob_name)[0] or "application/octet-stream"
    return image_bytes, content_type

def upload_blob_image(image: bytes, filename, container_name: str):
    try:
        if filename:
            file_extension = Path(filename).suffix
            blob_name = f"{uuid.uuid4()}{file_extension}"
            print(f"Testing blob file name: {blob_name}")

            container_client = blob_service_client.get_container_client(container=container_name)

            # If container doesn't exist create else just as normal.
            logger.info(f"TESTING container client: {container_client}")

            if not container_client.exists():
                try:
                    container_client.create_container(
                        # public_access="container" # Makes sure Access level is not annonomous (change if needed).
                        )
                    logger.info(f"Container '{container_name}' created successfully.")
                except ResourceExistsError:
                    # Safe fallback if another request or process already created it
                    print(f"Container '{container_name}' already exists.")

            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(image, overwrite=True)

            blob_url = blob_client.url
            return blob_url

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"ERROR: {e}"
        )
