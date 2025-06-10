from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, String, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
import datetime

if TYPE_CHECKING:
    from .pbooktrade import Pbooktrade
    from .favorite4p import Favorite4p
    from .pbasket2p import Pbasket2p
    from .pbasket2c import Pbasket2c
    from .pbasket2s import Pbasket2s
    from .preceipt2p import Preceipt2p
    from .preceipt2s import Preceipt2s
    from .ppayment import Ppayment

class Personal(Base):
    __tablename__ = 'personal'

    pid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    birth: Mapped[str] = mapped_column(String(10, 'utf8mb4_general_ci'))
    tel: Mapped[str] = mapped_column(String(13, 'utf8mb4_general_ci'))
    email: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    password: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    nickname: Mapped[str] = mapped_column(String(64, 'utf8mb4_general_ci'))
    address: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    region: Mapped[str] = mapped_column(String(64, 'utf8mb4_general_ci'))
    bankname: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    bankaccount: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'))
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    img: Mapped[Optional[str]] = mapped_column(String(255, 'utf8mb4_general_ci'))

    pbooktrade: Mapped[List['Pbooktrade']] = relationship('Pbooktrade', back_populates='personal')
    favorite4p: Mapped[List['Favorite4p']] = relationship('Favorite4p', back_populates='personal')
    pbasket2c: Mapped[List['Pbasket2c']] = relationship('Pbasket2c', back_populates='personal')
    pbasket2p: Mapped[List['Pbasket2p']] = relationship('Pbasket2p', back_populates='personal')
    preceipt2p: Mapped[List['Preceipt2p']] = relationship('Preceipt2p', back_populates='personal')
    pbasket2s: Mapped[List['Pbasket2s']] = relationship('Pbasket2s', back_populates='personal')
    preceipt2s: Mapped[List['Preceipt2s']] = relationship('Preceipt2s', back_populates='personal')
    ppayment: Mapped[List['Ppayment']] = relationship('Ppayment', back_populates='personal')