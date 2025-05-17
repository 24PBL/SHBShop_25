from sqlalchemy import BigInteger, ForeignKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .pbooktrade import Pbooktrade
    from .commercial import Commercial

class Cbasket2p(Base):
    __tablename__ = 'cbasket2p'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['pbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_pbooktrade_TO_cbasket2p_1'),
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_cbasket2p_1'),
        ForeignKeyConstraint(['sellerid'], ['pbooktrade.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_pbooktrade_TO_cbasket2p_2'),
        Index('FK_commercial_TO_cbasket2p_1', 'cid'),
        Index('FK_pbooktrade_TO_cbasket2p_1', 'bid'),
        Index('FK_pbooktrade_TO_cbasket2p_2', 'sellerid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    sellerid: Mapped[int] = mapped_column(BigInteger)

    pbooktrade: Mapped['Pbooktrade'] = relationship('Pbooktrade', foreign_keys=[bid], back_populates='cbasket2p')
    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='cbasket2p')
    pbooktrade_: Mapped['Pbooktrade'] = relationship('Pbooktrade', foreign_keys=[sellerid], back_populates='cbasket2p_')