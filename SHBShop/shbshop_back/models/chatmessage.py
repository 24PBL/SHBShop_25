from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, ForeignKeyConstraint, Index, Integer, String, text, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
import datetime

if TYPE_CHECKING:
    from .chatroom import Chatroom

class Chatmessage(Base):
    __tablename__ = 'chatmessage'
    __table_args__ = (
        ForeignKeyConstraint(['chid'], ['chatroom.chid'], ondelete='CASCADE', onupdate='RESTRICT', name='FK_chatroom_TO_chatmessage_1'),
        Index('FK_chatroom_TO_chatmessage_1', 'chid')
    )

    cmid: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    chid: Mapped[int] = mapped_column(BigInteger)
    senderType: Mapped[int] = mapped_column(Integer)
    senderid: Mapped[int] = mapped_column(BigInteger)
    message: Mapped[Optional[str]] = mapped_column(Text(collation='utf8mb4_general_ci'), nullable=True)
    img: Mapped[str] = mapped_column(String(255, 'utf8mb4_general_ci'), nullable=True)
    createAt: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    chatroom: Mapped['Chatroom'] = relationship('Chatroom', back_populates='chatmessage')