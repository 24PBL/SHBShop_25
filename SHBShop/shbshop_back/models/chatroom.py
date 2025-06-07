from typing import List, TYPE_CHECKING
from sqlalchemy import BigInteger, Integer, text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
import datetime

if TYPE_CHECKING:
    from .chatmessage import Chatmessage

class Chatroom(Base):
    __tablename__ = 'chatroom'

    chid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user1type: Mapped[int] = mapped_column(Integer, nullable=True)
    user1id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    user2type: Mapped[int] = mapped_column(Integer, nullable=True)
    user2id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    chatmessage: Mapped[List['Chatmessage']] = relationship('Chatmessage', back_populates='chatroom')