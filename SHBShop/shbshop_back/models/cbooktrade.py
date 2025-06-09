from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .commercial import Commercial
    from .cbasket2p import Cbasket2c
    from .pbasket2p import Pbasket2c
    from .cpayment import Cpayment

class Cbooktrade(Base):
    __tablename__ = 'cbooktrade'
    __table_args__ = (
        ForeignKeyConstraint(['cid'], ['commercial.cid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_commercial_TO_cbooktrade_1'),
        ForeignKeyConstraint(['cpid'], ['cpayment.cpid'], name='FK_cbooktrade_To_cpayment_1'),
        Index('FK_commercial_TO_cbooktrade_1', 'cid'),
        Index('FK_cbooktrade_To_cpayment_1', 'cpid')
    )

    bid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    cid: Mapped[int] = mapped_column(BigInteger)
    cpid: Mapped[int] = mapped_column(BigInteger, nullable=True)
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

    commercial: Mapped['Commercial'] = relationship('Commercial', back_populates='cbooktrade')
    cbasket2c: Mapped[List['Cbasket2c']] = relationship('Cbasket2c', foreign_keys='[Cbasket2c.bid]', back_populates='cbooktrade')
    cbasket2c_: Mapped[List['Cbasket2c']] = relationship('Cbasket2c', foreign_keys='[Cbasket2c.sellerid]', back_populates='cbooktrade_')
    pbasket2c: Mapped[List['Pbasket2c']] = relationship('Pbasket2c', foreign_keys='[Pbasket2c.bid]', back_populates='cbooktrade')
    pbasket2c_: Mapped[List['Pbasket2c']] = relationship('Pbasket2c', foreign_keys='[Pbasket2c.sellerid]', back_populates='cbooktrade_')
    cpayment: Mapped['Cpayment'] = relationship('Cpayment', back_populates='cbooktrade')