import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import BaseModel
from sqlalchemy import select

from src.models import User, Organisation
from sqlalchemy.ext.asyncio import AsyncSession

from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from sqlalchemy.exc import SQLAlchemyError
import uuid
from src.role import UserRole   # ENUM for role.



# Using Argon2 not Bcrypt.
password_hash = PasswordHash((Argon2Hasher(), ))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# to get a string like this run:
# openssl rand -hex 32
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is missing")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


# Reused Exception
UNAUTHORISED_401_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid email or password",
)

"""
TOKEN OPERATIONS
"""




"""
FOR SIGNUP OPERATION
"""
async def validateSignUp(
        org_name: str,
        email: str,
        password: str, 
        role: UserRole,
        session: AsyncSession,
) -> bool:
    try:
        # Get the org_id.
        result = await session.execute(
            select(Organisation).where(Organisation.name==org_name)
        )
        current_organisation = result.scalar_one_or_none()

        if current_organisation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The specified organisation does not exist."
            )

        # Check if email is not already in the db for that org.
        result = await session.execute(
            select(User).join(
                Organisation, 
                User.organisation_id==Organisation.id
                ).where(
                User.email == email, 
                User.organisation_id==Organisation.id
            )
        )
        user = result.scalar_one_or_none()
            
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already in use"
            )

        # Create a new user in the database.
        # For now adding every new user in same organisation.
        password_hash = await generate_hash(password)

        new_user = User(
            email=email,
            organisation_id=current_organisation.id,
            password_hash=password_hash
        )
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return True

    except SQLAlchemyError as e:
        print(f"ERROR {e.code}: {e._message}")
        raise



"""
FOR LOGIN OPERATION
"""
async def validateUserLogin(
        email: str, 
        plain_password: str,
        session: AsyncSession,
    ) -> User:
    try:
        result = await session.execute(
            select(User).where(User.email==email)
        )
        user = result.scalar_one_or_none()

        if user:
            if verify_hash_password(plain_password=plain_password, hashed_password=user.password_hash):
                return user
            else:
                print(f"Password doesn't match...")
        

    except SQLAlchemyError as e:
        print(f"ERROR {e.code}: {e._message}")
        raise

    raise UNAUTHORISED_401_EXCEPTION



async def generate_hash(string: str) -> str:
    return password_hash.hash(string)

async def verify_hash_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)



### PREVIOUS METHOD.
async def get_user_by_email(session: AsyncSession, username) -> (User | None):
    if username is None:
        raise UNAUTHORISED_401_EXCEPTION

    result = await session.execute(
        select(User).where(User.email==username)
    )
    user = result.scalar_one_or_none()
    return user





async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        session: AsyncSession
    ):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials i.e. token.",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = get_user_by_email(session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

"""
FROM THE JWT FASTAPI DOCS.
Not needed rn cause I don't have is_active attribute for User BaseModel and schema.
"""
# async def get_current_active_user(
#         current_user: Annotated[User, Depends(get_current_user)]
# ):
#     if current_user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Inactive User"
#         )
#     return current_user
