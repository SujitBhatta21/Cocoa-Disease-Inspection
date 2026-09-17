"""Development seed data."""

from sqlalchemy import select

from src.db.session import SessionLocal
from src.models import Organisation, User
from src.role import UserRole, UserStatus


async def seed_database() -> None:
    seed_email = "dummy@gmail.com"
    seed_master_admin_email = "admin@gmail.com"
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

        # Adding normal user.
        result = await session.execute(
            select(User).where(User.email == seed_email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user is None:
            db_user = User(
                email=seed_email,
                password_hash="$argon2id$v=19$m=65536,t=3,p=4$wagCPXjifgvUFBzq4hqe3w$CYaIb8sB+wtD+Vu/P4uod1+Qof8h+1g7bbDlBID48Rc",
                organisation_id=db_org.id,
                role=UserRole.USER,
                status=UserStatus.APPROVED

            )
            session.add(db_user)

        # Adding an admin user for that organisation.
        result = await session.execute(
            select(User).where(User.email == seed_master_admin_email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user is None:
            db_user = User(
                email=seed_master_admin_email,
                password_hash="$argon2id$v=19$m=65536,t=3,p=4$gQSQpnXYi/HYdwkqGQV+ng$JRsZFynAgn/ZAHxE1+ezzJ6aRmR73kBvTA66n/wL28A",
                organisation_id=db_org.id,
                role=UserRole.ADMIN,
                status=UserStatus.APPROVED
            )
            session.add(db_user)

        await session.commit()
