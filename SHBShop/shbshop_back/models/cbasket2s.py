from sqlalchemy import BigInteger, ForeignKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .sbooktrade import Sbooktrade
    from .commercial import Commercial

class Cbasket2s(Base):
    __tablename__ = 'cbasket2s'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['sbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_cbasket2s_1'),
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_cbasket2s_1'),
        ForeignKeyConstraint(['shopid'], ['sbooktrade.sid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_cbasket2s_2'),
        Index('FK_commercial_TO_cbasket2s_1', 'cid'),
        Index('FK_sbooktrade_TO_cbasket2s_1', 'bid'),
        Index('FK_sbooktrade_TO_cbasket2s_2', 'shopid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    shopid: Mapped[int] = mapped_column(BigInteger)

    sbooktrade: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[bid], back_populates='cbasket2s')
    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='cbasket2s')
    sbooktrade_: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[shopid], back_populates='cbasket2s_')