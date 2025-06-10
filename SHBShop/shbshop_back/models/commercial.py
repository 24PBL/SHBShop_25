from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, Integer, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
import datetime

if TYPE_CHECKING:
    from .cbooktrade import Cbooktrade
    from .commercial_cert import Commercialcert
    from .shop import Shop
    from .favorite4c import Favorite4c
    from .modiaddress import Modiaddress
    from .cbasket2p import Cbasket2p
    from .cbasket2c import Cbasket2c
    from .cbasket2s import Cbasket2s
    from .creceipt2p import Creceipt2p
    from .creceipt2s import Creceipt2s
    from .cpayment import Cpayment

class Commercial(Base):
    __tablename__ = 'commercial'

    cid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    presidentName: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    businessmanName: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    birth: Mapped[str] = mapped_column(String(10, 'utf8mb4_general_ci'))
    tel: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    email: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    businessEmail: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    password: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    nickname: Mapped[str] = mapped_column(String(64, 'utf8mb4_general_ci'))
    address: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    region: Mapped[str] = mapped_column(String(64, 'utf8mb4_general_ci'))
    coNumber: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    licence: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    bankname: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    bankaccount: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    accountPhoto: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    state: Mapped[int] = mapped_column(Integer, server_default=text("'1'"))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    img: Mapped[Optional[str]] = mapped_column(String(255, 'utf8mb4_general_ci'))

    cbooktrade: Mapped[List['Cbooktrade']] = relationship('Cbooktrade', back_populates='commercial')
    commercialcert: Mapped[List['Commercialcert']] = relationship('Commercialcert', back_populates='commercial')
    modiaddress: Mapped[List['Modiaddress']] = relationship('Modiaddress', back_populates='commercial')
    shop: Mapped[List['Shop']] = relationship('Shop', back_populates='commercial')
    cbasket2c: Mapped[List['Cbasket2c']] = relationship('Cbasket2c', back_populates='commercial')
    cbasket2p: Mapped[List['Cbasket2p']] = relationship('Cbasket2p', back_populates='commercial')
    creceipt2p: Mapped[List['Creceipt2p']] = relationship('Creceipt2p', back_populates='commercial')
    favorite4c: Mapped[List['Favorite4c']] = relationship('Favorite4c', back_populates='commercial')
    cbasket2s: Mapped[List['Cbasket2s']] = relationship('Cbasket2s', back_populates='commercial')
    creceipt2s: Mapped[List['Creceipt2s']] = relationship('Creceipt2s', back_populates='commercial')
    cpayment: Mapped[List['Cpayment']] = relationship('Cpayment', back_populates='commercial')