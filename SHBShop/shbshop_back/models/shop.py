from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
import datetime

if TYPE_CHECKING:
    from .commercial import Commercial
    from .favorite4c import Favorite4c
    from .favorite4p import Favorite4p
    from .sbooktrade import Sbooktrade
    from .spayment import Spayment

class Shop(Base):
    __tablename__ = 'shop'
    __table_args__ = (
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_shop_1'),
        Index('FK_commercial_TO_shop_1', 'cid')
    )

    sid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    presidentName: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    businessmanName: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    shopName: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    shoptel: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    businessEmail: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    address: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    region: Mapped[str] = mapped_column(String(64, 'utf8mb4_general_ci'))
    open: Mapped[str] = mapped_column(String(16, 'utf8mb4_general_ci'))
    close: Mapped[str] = mapped_column(String(16, 'utf8mb4_general_ci'))
    holiday: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    shopimg1: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    shopimg2: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    shopimg3: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    etc: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='shop')
    favorite4c: Mapped[List['Favorite4c']] = relationship('Favorite4c', back_populates='shop')
    favorite4p: Mapped[List['Favorite4p']] = relationship('Favorite4p', back_populates='shop')
    sbooktrade: Mapped[List['Sbooktrade']] = relationship('Sbooktrade', back_populates='shop')
    spayment: Mapped[List['Spayment']] = relationship('Spayment', back_populates='shop')