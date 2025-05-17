from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .sbooktrade import Sbooktrade
    from .personal import Personal

class Preceipt2s(Base):
    __tablename__ = 'preceipt2s'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['sbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_preceipt2s_1'),
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_preceipt2s_1'),
        ForeignKeyConstraint(['shopid'], ['sbooktrade.sid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_preceipt2s_2'),
        Index('FK_personal_TO_preceipt2s_1', 'pid'),
        Index('FK_sbooktrade_TO_preceipt2s_1', 'bid'),
        Index('FK_sbooktrade_TO_preceipt2s_2', 'shopid')
    )

    rid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    shopid: Mapped[int] = mapped_column(BigInteger)
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'결제완료'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    sbooktrade: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[bid], back_populates='preceipt2s')
    personal: Mapped['Personal'] = relationship('Personal', back_populates='preceipt2s')
    sbooktrade_: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[shopid], back_populates='preceipt2s_')