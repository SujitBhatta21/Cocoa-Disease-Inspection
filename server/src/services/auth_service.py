import os
import json
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import BaseModel
from sqlalchemy import select, update

from src.models import User, Organisation, Inspection
from sqlalchemy.ext.asyncio import AsyncSession

from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func # For aggregates

from src.role import UserRole, UserStatus   # ENUMs for user access.
from src.schemas import UserStatusUpdates



# Using Argon2 not Bcrypt.
password_hash = PasswordHash((Argon2Hasher(), ))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# to get a string like this run:
# openssl rand -hex 32
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
        user_status: UserStatus,
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
                detail="Given oganisation does not exist in our database."
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
        password_hash = generate_hash(password)

        new_user = User(
            email=email,
            organisation_id=current_organisation.id,
            password_hash=password_hash,
            role=role,
            status=user_status,
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



def generate_hash(string: str) -> str:
    return password_hash.hash(string)

def verify_hash_password(plain_password: str, hashed_password: str) -> bool:
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
    user = await get_user_by_email(session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_org_name(
        organisation_id,
        session: AsyncSession
    ) -> str | None:
    if organisation_id is None:
        raise UNAUTHORISED_401_EXCEPTION

    result = await session.execute(
        select(Organisation).where(Organisation.id==organisation_id)
    )
    org = result.scalar_one_or_none()
    if org is not None:
        return org.name
    return


async def get_admin_and_user_count(org_id, session:AsyncSession) -> list[int]:
    res = []

    result = await session.execute(
        select(func.count(User.id)).where(User.role==UserRole.ADMIN)
    )
    result = await session.execute(
        select(
            func.count().filter(User.role == UserRole.ADMIN),
            func.count().filter(User.role == UserRole.USER)
        ).where(User.organisation_id==org_id)
    )
    admin_count, user_count = result.one()

    return [admin_count, user_count]

"""
Takes token breaks the token then gets organisation name to get all it's inspections.
"""
async def get_all_inspections_by_org(
        jwt_token: Annotated[str, Depends(oauth2_scheme)],
        session: AsyncSession
):
    curr_user = await get_current_user(token=jwt_token, session=session)

    # Verifying whether this is an admin.
    if curr_user.role is not UserRole.ADMIN:
        raise UNAUTHORISED_401_EXCEPTION

    # Total user (including admin in org)
    all_user_count = await get_admin_and_user_count(curr_user.organisation_id, session)

    result = await session.execute(
        select(Inspection).join(
            User, User.id == Inspection.user_id
        ).where(
            User.organisation_id==curr_user.organisation_id
        )
    )
    all_inspections = result.scalars().all()

    # Count corrected inspections from the already-loaded organisation results.
    human_corrected_count = sum(
        inspection.human_corrected for inspection in all_inspections
    )

    # Get curr organisation pending users count.
    pending_users = await get_curr_pending_users(jwt_token=jwt_token, session=session)

    return all_user_count, all_inspections, human_corrected_count, pending_users


async def get_curr_pending_users(        
        jwt_token: Annotated[str, Depends(oauth2_scheme)],
        session: AsyncSession,
    ):

    curr_user = await get_current_user(token=jwt_token, session=session)

    # Verifying whether this is an admin.
    if curr_user.role is not UserRole.ADMIN:
        raise UNAUTHORISED_401_EXCEPTION

    # All necessary validation done in get_all_inspections_by_org.
    result = await session.execute(
        select(User).where(User.status==UserStatus.PENDING, User.organisation_id==curr_user.organisation_id)
    )
    all_pending_users = result.scalars().all()
    return all_pending_users



async def update_status(
        updates: UserStatusUpdates,
        jwt_token: Annotated[str, Depends(oauth2_scheme)],
        session: AsyncSession,
) -> bool:
    curr_user = await get_current_user(token=jwt_token, session=session)

    if curr_user.status != UserStatus.APPROVED and curr_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Previllages only for Admin")

    
    for item in updates.updates:
        result = await session.execute(
            select(User).where(User.id==item.user_id)
        )
        user = result.scalar_one()
        user.status = item.status

    await session.commit()

    return True



async def update_password(
        jwt_token: Annotated[str, Depends(oauth2_scheme)],
        new_password: str,
        curr_password: str,
        session: AsyncSession, 
):
    curr_user = await get_current_user(token=jwt_token, session=session)

    # Convert the new_password to Argon2 or Bcrypt2 
    password_hash = generate_hash(new_password)

    try:
        # First verify if user curr_password match one stored in db.
        if verify_hash_password(plain_password=curr_password, hashed_password=curr_user.password_hash):
            # Update the password.
            curr_user.password_hash = password_hash
            await session.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password doesn't match",
            )

    except SQLAlchemyError as e:
        await session.rollback()
        print(f"ERROR {e.code}: {e._message}")
        raise

    return True
