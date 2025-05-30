from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .commercial import Commercial

class Creceipt2s(Base):
    __tablename__ = 'creceipt2s'
    __table_args__ = (
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_creceipt2s_1'),
        Index('FK_commercial_TO_creceipt2s_1', 'cid')
    )

    rid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    orderid: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), unique=True)
    amount: Mapped[int] = mapped_column(Integer)
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'결제완료'"))
    payment_method: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    payment_key: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    paidAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))

    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='creceipt2s')