from sqlalchemy import BigInteger, ForeignKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .cbooktrade import Cbooktrade
    from .personal import Personal

class Pbasket2c(Base):
    __tablename__ = 'pbasket2c'
    __table_args__ = (
        ForeignKeyConstraint(['bid'], ['cbooktrade.bid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_cbooktrade_TO_pbasket2c_1'),
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_pbasket2c_1'),
        ForeignKeyConstraint(['sellerid'], ['cbooktrade.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_cbooktrade_TO_pbasket2c_2'),
        Index('FK_cbooktrade_TO_pbasket2c_1', 'bid'),
        Index('FK_cbooktrade_TO_pbasket2c_2', 'sellerid'),
        Index('FK_personal_TO_pbasket2c_1', 'pid')
    )

    idx: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    bid: Mapped[int] = mapped_column(BigInteger)
    sellerid: Mapped[int] = mapped_column(BigInteger)

    cbooktrade: Mapped['Cbooktrade'] = relationship('Cbooktrade', foreign_keys=[bid], back_populates='pbasket2c')
    personal: Mapped['Personal'] = relationship('Personal', back_populates='pbasket2c')
    cbooktrade_: Mapped['Cbooktrade'] = relationship('Cbooktrade', foreign_keys=[sellerid], back_populates='pbasket2c_')