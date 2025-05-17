from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .sbooktrade import Sbooktrade
    from .commercial import Commercial

class Creceipt2s(Base):
    __tablename__ = 'creceipt2s'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['sbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_creceipt2s_1'),
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_creceipt2s_1'),
        ForeignKeyConstraint(['shopid'], ['sbooktrade.sid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_creceipt2s_2'),
        Index('FK_commercial_TO_creceipt2s_1', 'cid'),
        Index('FK_sbooktrade_TO_creceipt2s_1', 'bid'),
        Index('FK_sbooktrade_TO_creceipt2s_2', 'shopid')
    )

    rid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    shopid: Mapped[int] = mapped_column(BigInteger)
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'결제완료'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    sbooktrade: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[bid], back_populates='creceipt2s')
    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='creceipt2s')
    sbooktrade_: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[shopid], back_populates='creceipt2s_')