from sqlmodel import Session, create_engine

import app.models
from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# NOTE: make sure all SQLModel models are imported (app.models) before initializing DB
# otherwse, SQLModel might fail to initialize relationships properly


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines

    if settings.ENVIRONMENT == "local":
        from sqlmodel import SQLModel

        SQLModel.metadata.create_all(engine)
