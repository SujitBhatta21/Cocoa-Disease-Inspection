"""Development seed data."""

from sqlalchemy import select

from src.db.session import SessionLocal
from src.models import Organisation, User


async def seed_database() -> None:
    seed_email = "dummy@gmail.com"
    org_name = "Dummy_org"

    async with SessionLocal() as session:
        result = await session.execute(
            select(Organisation).where(Organisation.name == org_name)
        )
        db_org = result.scalar_one_or_none()

        if db_org is None:
            db_org = Organisation(name=org_name)
            session.add(db_org)
            await session.flush()

        result = await session.execute(
            select(User).where(User.email == seed_email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user is None:
            db_user = User(
                email=seed_email,
                password_hash="dummy",
                organisation_id=db_org.id,
            )
            session.add(db_user)

        await session.commit()
