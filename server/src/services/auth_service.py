from sqlalchemy import select
from src.schemas import UserResponse

from src.models import User
from sqlalchemy.ext.asyncio import AsyncSession


async def isUserValid(email: str, session: AsyncSession):
    try:
        user = await session.execute(
            select(User).where(User.email==email)
        )
        if user:
            return True
        else:
            return False
    except:
        pass

async def getUser(email, session: AsyncSession):
    try:
        if (isUserValid):
            result = await session.execute(
                select(User).where(User.email==email)
            )
            user = result.scalar_one_or_none()
            return user
        return "Teri jhuki najar"

    except Exception as e:
        print(f"Error: User not in db. {e}")
        raise
