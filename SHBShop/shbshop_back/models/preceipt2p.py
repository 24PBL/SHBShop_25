from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .pbooktrade import Pbooktrade
    from .personal import Personal

class Preceipt2p(Base):
    __tablename__ = 'preceipt2p'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['pbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_pbooktrade_TO_preceipt2p_1'),
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_preceipt2p_1'),
        ForeignKeyConstraint(['sellerid'], ['pbooktrade.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_pbooktrade_TO_preceipt2p_2'),
        Index('FK_pbooktrade_TO_preceipt2p_1', 'bid'),
        Index('FK_pbooktrade_TO_preceipt2p_2', 'sellerid'),
        Index('FK_personal_TO_preceipt2p_1', 'pid')
    )

    rid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    sellerid: Mapped[int] = mapped_column(BigInteger)
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'결제완료'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    pbooktrade: Mapped['Pbooktrade'] = relationship('Pbooktrade', foreign_keys=[bid], back_populates='preceipt2p')
    personal: Mapped['Personal'] = relationship('Personal', back_populates='preceipt2p')
    pbooktrade_: Mapped['Pbooktrade'] = relationship('Pbooktrade', foreign_keys=[sellerid], back_populates='preceipt2p_')