from sqlalchemy import BigInteger, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

class Vaild4cmd(Base):
    __tablename__ = 'vaild4cmd'

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String(255))
    randomCode: Mapped[int] = mapped_column(Integer)