from sqlalchemy import BigInteger, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

class Auth4cur(Base):
    __tablename__ = 'auth4cur'

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    birth: Mapped[str] = mapped_column(String(10, 'utf8mb4_general_ci'))
    tel: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    email: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    authCode: Mapped[int] = mapped_column(Integer)