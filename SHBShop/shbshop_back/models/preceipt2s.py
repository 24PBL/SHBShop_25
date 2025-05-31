from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .personal import Personal

class Preceipt2s(Base):
    __tablename__ = 'preceipt2s'
    __table_args__ = (
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_preceipt2s_1'),
        Index('FK_personal_TO_preceipt2s_1', 'pid')
    )

    rid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    orderid: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), unique=True)
    amount: Mapped[int] = mapped_column(Integer)
    installment_months: Mapped[int] = mapped_column(Integer, nullable=True)
    state: Mapped[int] = mapped_column(Integer, server_default=text("9"))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'결제진행중'"))
    payment_method: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    payment_key: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    paidAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    personal: Mapped['Personal'] = relationship('Personal', back_populates='preceipt2s')