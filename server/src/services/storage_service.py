"""
Service for Azure Storage
"""
import os
import uuid
import logging
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
                        public_access="container" # Makes sure Access level is not annonomous (change if needed).
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
