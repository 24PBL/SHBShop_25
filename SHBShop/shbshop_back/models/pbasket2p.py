from sqlalchemy import BigInteger, ForeignKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .pbooktrade import Pbooktrade
    from .personal import Personal

class Pbasket2p(Base):
    __tablename__ = 'pbasket2p'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['pbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_pbooktrade_TO_pbasket2p_1'),
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_pbasket2p_1'),
        ForeignKeyConstraint(['sellerid'], ['pbooktrade.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_pbooktrade_TO_pbasket2p_2'),
        Index('FK_pbooktrade_TO_pbasket2p_1', 'bid'),
        Index('FK_pbooktrade_TO_pbasket2p_2', 'sellerid'),
        Index('FK_personal_TO_pbasket2p_1', 'pid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    sellerid: Mapped[int] = mapped_column(BigInteger)

    pbooktrade: Mapped['Pbooktrade'] = relationship('Pbooktrade', foreign_keys=[bid], back_populates='pbasket2p')
    personal: Mapped['Personal'] = relationship('Personal', back_populates='pbasket2p')
    pbooktrade_: Mapped['Pbooktrade'] = relationship('Pbooktrade', foreign_keys=[sellerid], back_populates='pbasket2p_')