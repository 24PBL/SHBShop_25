from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .pbooktrade import Pbooktrade
    from .personal import Personal

class Ppayment(Base):
    __tablename__ = 'ppayment'
    __table_args__ = (
        ForeignKeyConstraint(['pid'], ['personal.pid'], name='FK_ppayment_To_personal_1'),
        Index('FK_ppayment_To_personal_1', 'pid')
    )

    ppid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    price: Mapped[int] = mapped_column(Integer)
    state: Mapped[int] = mapped_column(Integer, server_default=text("10"))
    completePhoto: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'정산진행중'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    completedAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    pbooktrade: Mapped[List['Pbooktrade']] = relationship('Pbooktrade', back_populates='ppayment')
    personal: Mapped['Personal'] = relationship('Personal', back_populates='ppayment')