from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime
from typing import TYPE_CHECKING, List
from .base import Base

if TYPE_CHECKING:
    from .shop import Shop
    from .cbasket2s import Cbasket2s
    from .pbasket2s import Pbasket2s
    from .spayment import Spayment

class Sbooktrade(Base):
    __tablename__ = 'sbooktrade'
    __table_args__ = (
        ForeignKeyConstraint(['sid'], ['shop.sid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_shop_TO_sbooktrade_1'),
        ForeignKeyConstraint(['spid'], ['spayment.spid'], name='FK_sbooktrade_To_spayment_1'),
        Index('FK_shop_TO_sbooktrade_1', 'sid'),
        Index('FK_sbooktrade_To_spayment_1', 'spid')
    )

    bid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sid: Mapped[int] = mapped_column(BigInteger)
    spid: Mapped[int] = mapped_column(BigInteger, nullable=True)
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

    shop: Mapped['Shop'] = relationship('Shop', back_populates='sbooktrade')
    cbasket2s: Mapped[List['Cbasket2s']] = relationship('Cbasket2s', foreign_keys='[Cbasket2s.bid]', back_populates='sbooktrade')
    cbasket2s_: Mapped[List['Cbasket2s']] = relationship('Cbasket2s', foreign_keys='[Cbasket2s.shopid]', back_populates='sbooktrade_')
    pbasket2s: Mapped[List['Pbasket2s']] = relationship('Pbasket2s', foreign_keys='[Pbasket2s.bid]', back_populates='sbooktrade')
    pbasket2s_: Mapped[List['Pbasket2s']] = relationship('Pbasket2s', foreign_keys='[Pbasket2s.shopid]', back_populates='sbooktrade_')
    spayment: Mapped['Spayment'] = relationship('Spayment', back_populates='sbooktrade')