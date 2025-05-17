from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .personal import Personal
    from .cbasket2p import Cbasket2p
    from .pbasket2p import Pbasket2p
    from .creceipt2p import Creceipt2p
    from .preceipt2p import Preceipt2p

class Pbooktrade(Base):
    __tablename__ = 'pbooktrade'
    __table_args__ = (
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_pbooktrade_1'),
        Index('FK_personal_TO_pbooktrade_1', 'pid')
    )

    bid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    title: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    author: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    publish: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    isbn: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    price: Mapped[int] = mapped_column(Integer)
    detail: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    region: Mapped[str] = mapped_column(String(64, 'utf8mb4_general_ci'))
    img1: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    img2: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    img3: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    personal: Mapped['Personal'] = relationship('Personal', back_populates='pbooktrade')
    cbasket2p: Mapped[List['Cbasket2p']] = relationship('Cbasket2p', foreign_keys='[Cbasket2p.bid]', back_populates='pbooktrade')
    cbasket2p_: Mapped[List['Cbasket2p']] = relationship('Cbasket2p', foreign_keys='[Cbasket2p.sellerid]', back_populates='pbooktrade_')
    creceipt2p: Mapped[List['Creceipt2p']] = relationship('Creceipt2p', foreign_keys='[Creceipt2p.bid]', back_populates='pbooktrade')
    creceipt2p_: Mapped[List['Creceipt2p']] = relationship('Creceipt2p', foreign_keys='[Creceipt2p.sellerid]', back_populates='pbooktrade_')
    pbasket2p: Mapped[List['Pbasket2p']] = relationship('Pbasket2p', foreign_keys='[Pbasket2p.bid]', back_populates='pbooktrade')
    pbasket2p_: Mapped[List['Pbasket2p']] = relationship('Pbasket2p', foreign_keys='[Pbasket2p.sellerid]', back_populates='pbooktrade_')
    preceipt2p: Mapped[List['Preceipt2p']] = relationship('Preceipt2p', foreign_keys='[Preceipt2p.bid]', back_populates='pbooktrade')
    preceipt2p_: Mapped[List['Preceipt2p']] = relationship('Preceipt2p', foreign_keys='[Preceipt2p.sellerid]', back_populates='pbooktrade_')