from fastapi import HTTPException
from sqlalchemy import select
from src.schemas import UserResponse, UserCreate

from src.models import User
from sqlalchemy.ext.asyncio import AsyncSession

from pwdlib import PasswordHash, exceptions
from pwdlib.hashers.argon2 import Argon2Hasher

from sqlalchemy.exc import SQLAlchemyError
import uuid
from src.role import UserRole   # ENUM for role.


# Using Argon2 not Bcrypt.
password_hash = PasswordHash((Argon2Hasher(), ))


"""
FOR SIGNUP OPERATION
"""
async def checkIfUsernameExists():
    pass

async def validateSignUp(
        org_id: uuid.UUID,
        email: str,
        password: str, 
        role: UserRole,
        session: AsyncSession,
) -> bool:
    try:
        # Check if email is not already in the db for that org.
        result = await session.execute(
            select(User).where(
                User.email == email, 
                User.organisation_id==org_id
            )
        )
        user = result.scalar_one_or_none()

        if user:
            raise HTTPException(
                status_code=409,
                detail="Username already in use"
            )

        # Create a new user in the database.
        # For now adding every new user in same organisation.
        password_hash = generate_hash(password)

        user = User(
            email=email,
            organisation_id=org_id,
            password_hash=password_hash
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return True

    except SQLAlchemyError as e:
        print(f"ERROR {e.code}: {e._message}")
        raise



"""
FOR LOGIN OPERATION
"""
async def validateLogin(
        email: str, 
        plain_password: str,
        session: AsyncSession,
    ) -> bool:
    try:
        result = await session.execute(
            select(User).where(User.email==email)
        )
        user = result.scalar_one_or_none()

        if user:
            if password_hash.verify(plain_password, user.password_hash):
                return True
            else:
                print(f"Password doesn't match...")
        else:
            return False

    except SQLAlchemyError as e:
        print(f"ERROR {e.code}: {e._message}")
        raise

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password",
    )



async def generate_hash(string: str) -> str:
    return password_hash.hash(string)