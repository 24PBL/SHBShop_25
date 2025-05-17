from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .cbooktrade import Cbooktrade
    from .commercial import Commercial

class Creceipt2c(Base):
    __tablename__ = 'creceipt2c'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['cbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_cbooktrade_TO_creceipt2c_1'),
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_creceipt2c_1'),
        ForeignKeyConstraint(['sellerid'], ['cbooktrade.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_cbooktrade_TO_creceipt2c_2'),
        Index('FK_cbooktrade_TO_creceipt2c_1', 'bid'),
        Index('FK_cbooktrade_TO_creceipt2c_2', 'sellerid'),
        Index('FK_commercial_TO_creceipt2c_1', 'cid')
    )

    rid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    sellerid: Mapped[int] = mapped_column(BigInteger)
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    reason: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), server_default=text("'결제완료'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    cbooktrade: Mapped['Cbooktrade'] = relationship('Cbooktrade', foreign_keys=[bid], back_populates='creceipt2c')
    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='creceipt2c')
    cbooktrade_: Mapped['Cbooktrade'] = relationship('Cbooktrade', foreign_keys=[sellerid], back_populates='creceipt2c_')