from flask_sqlalchemy import SQLAlchemy
from models import Base
from flask_socketio import SocketIO

db = SQLAlchemy(model_class=Base)
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')