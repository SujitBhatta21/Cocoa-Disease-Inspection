"""
Service for Azure Storage
"""
import os
import uuid
from azure.identity import ManagedIdentityCredential, DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from azure.core.pipeline.policies import UserAgentPolicy

from fastapi import HTTPException
from pathlib import Path


# Create your credential you want to use
mi_credential = ManagedIdentityCredential()
def_credential = DefaultAzureCredential()

CONTAINER_NAME = os.getenv("CONTAINER_NAME")
STORAGE_ACCOUNT_NAME = os.getenv("STORAGE_ACCOUNT_NAME")

account_url = f"https://{STORAGE_ACCOUNT_NAME}.blob.core.windows.net"

# Set up user-agent override
class NoUserAgentPolicy(UserAgentPolicy):
    def on_request(self, request):
        pass

# Create the BlobServiceClient object
blob_service_client = BlobServiceClient(account_url, credential=def_credential, user_agent_policy=NoUserAgentPolicy())

container_client = blob_service_client.get_container_client(container=str(CONTAINER_NAME))


def get_storage_account_url():
    return account_url

def upload_blob_image(image: bytes, filename):
    try:
        if filename:
            file_extension = Path(filename).suffix
            blob_name = f"{uuid.uuid4()}{file_extension}"
            print(f"Testing blob file name: {blob_name}")

            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(image, overwrite=True)

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"ERROR: {e}"
        )
