from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .personal import Personal
    from .cbasket2p import Cbasket2p
    from .pbasket2p import Pbasket2p
    from .ppayment import Ppayment

class Pbooktrade(Base):
    __tablename__ = 'pbooktrade'
    __table_args__ = (
        ForeignKeyConstraint(['pid'], ['personal.pid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_personal_TO_pbooktrade_1'),
        ForeignKeyConstraint(['ppid'], ['ppayment.ppid'], name='FK_pbooktrade_To_ppayment_1'),
        Index('FK_personal_TO_pbooktrade_1', 'pid'),
        Index('FK_pbooktrade_To_ppayment_1', 'ppid')
    )

    bid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pid: Mapped[int] = mapped_column(BigInteger)
    ppid: Mapped[int] = mapped_column(BigInteger, nullable=True)
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
    state: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    orderid: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    consumerid: Mapped[int] = mapped_column(BigInteger, nullable=True)
    consumer_type: Mapped[int] = mapped_column(Integer, nullable=True)

    personal: Mapped['Personal'] = relationship('Personal', back_populates='pbooktrade')
    cbasket2p: Mapped[List['Cbasket2p']] = relationship('Cbasket2p', foreign_keys='[Cbasket2p.bid]', back_populates='pbooktrade')
    cbasket2p_: Mapped[List['Cbasket2p']] = relationship('Cbasket2p', foreign_keys='[Cbasket2p.sellerid]', back_populates='pbooktrade_')
    pbasket2p: Mapped[List['Pbasket2p']] = relationship('Pbasket2p', foreign_keys='[Pbasket2p.bid]', back_populates='pbooktrade')
    pbasket2p_: Mapped[List['Pbasket2p']] = relationship('Pbasket2p', foreign_keys='[Pbasket2p.sellerid]', back_populates='pbooktrade_')
    ppayment: Mapped['Ppayment'] = relationship('Ppayment', back_populates='pbooktrade')