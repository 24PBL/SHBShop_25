from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .commercial import Commercial

class Modiaddress(Base):
    __tablename__ = 'modiaddress'
    __table_args__ = (
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_modiaddress_1'),
        Index('FK_commercial_TO_modiaddress_1', 'cid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    name: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    presidentName: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    businessmanName: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    businessEmail: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    coNumber: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    address: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    licence: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'심사중'"))
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='modiaddress')