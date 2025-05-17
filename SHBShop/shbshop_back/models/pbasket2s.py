from sqlalchemy import BigInteger, ForeignKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .sbooktrade import Sbooktrade
    from .personal import Personal

class Pbasket2s(Base):
    __tablename__ = 'pbasket2s'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['sbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_pbasket2s_1'),
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_pbasket2s_1'),
        ForeignKeyConstraint(['shopid'], ['sbooktrade.sid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_sbooktrade_TO_pbasket2s_2'),
        Index('FK_personal_TO_pbasket2s_1', 'pid'),
        Index('FK_sbooktrade_TO_pbasket2s_1', 'bid'),
        Index('FK_sbooktrade_TO_pbasket2s_2', 'shopid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    shopid: Mapped[int] = mapped_column(BigInteger)

    sbooktrade: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[bid], back_populates='pbasket2s')
    personal: Mapped['Personal'] = relationship('Personal', back_populates='pbasket2s')
    sbooktrade_: Mapped['Sbooktrade'] = relationship('Sbooktrade', foreign_keys=[shopid], back_populates='pbasket2s_')