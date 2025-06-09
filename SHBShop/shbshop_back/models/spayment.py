from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .sbooktrade import Sbooktrade
    from .shop import Shop

class Spayment(Base):
    __tablename__ = 'spayment'
    __table_args__ = (
        ForeignKeyConstraint(['sid'], ['shop.sid'], name='FK_spayment_To_shop_1'),
        Index('FK_spayment_To_shop_1', 'sid')
    )

    spid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sid: Mapped[int] = mapped_column(BigInteger)
    price: Mapped[int] = mapped_column(Integer)
    state: Mapped[int] = mapped_column(Integer, server_default=text("10"))
    completePhoto: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'정산진행중'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    completedAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    sbooktrade: Mapped[List['Sbooktrade']] = relationship('Sbooktrade', back_populates='spayment')
    shop: Mapped['Shop'] = relationship('Shop', back_populates='spayment')