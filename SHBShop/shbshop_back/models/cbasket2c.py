from sqlalchemy import BigInteger, ForeignKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .cbooktrade import Cbooktrade
    from .commercial import Commercial

class Cbasket2c(Base):
    __tablename__ = 'cbasket2c'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['cbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_cbooktrade_TO_cbasket2c_1'),
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_cbasket2c_1'),
        ForeignKeyConstraint(['sellerid'], ['cbooktrade.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_cbooktrade_TO_cbasket2c_2'),
        Index('FK_cbooktrade_TO_cbasket2c_1', 'bid'),
        Index('FK_cbooktrade_TO_cbasket2c_2', 'sellerid'),
        Index('FK_commercial_TO_cbasket2c_1', 'cid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    sellerid: Mapped[int] = mapped_column(BigInteger)

    cbooktrade: Mapped['Cbooktrade'] = relationship('Cbooktrade', foreign_keys=[bid], back_populates='cbasket2c')
    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='cbasket2c')
    cbooktrade_: Mapped['Cbooktrade'] = relationship('Cbooktrade', foreign_keys=[sellerid], back_populates='cbasket2c_')