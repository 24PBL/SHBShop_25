from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .cbooktrade import Cbooktrade
    from .commercial import Commercial

class Cpayment(Base):
    __tablename__ = 'cpayment'
    __table_args__ = (
        ForeignKeyConstraint(['cid'], ['commercial.cid'], name='FK_cpayment_To_commercial_1'),
        Index('FK_cpayment_To_commercial_1', 'cid')
    )

    cpid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    price: Mapped[int] = mapped_column(Integer)
    state: Mapped[int] = mapped_column(Integer, server_default=text("10"))
    completePhoto: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'정산진행중'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    completedAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    cbooktrade: Mapped[List['Cbooktrade']] = relationship('Cbooktrade', back_populates='cpayment')
    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='cpayment')