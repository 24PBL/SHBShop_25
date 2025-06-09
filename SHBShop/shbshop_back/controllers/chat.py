from flask import Blueprint, request, jsonify
from enum import Enum
from sqlalchemy import desc, and_, or_
from sqlalchemy.orm import joinedload
import os
from werkzeug.utils import secure_filename
from uuid import uuid4
import jwt
from utils.jwt_helper import token_required, socket_token_required

from models import Personal, Commercial, Chatroom, Chatmessage
from extensions import db, socketio

from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect
from flask_jwt_extended import decode_token

chat_bp = Blueprint("chat", __name__)

CHAT_IMG_UPLOAD_FOLDER = "static/chat"

SECRET_KEY = os.getenv("SECRET_KEY")

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

@socketio.on('join')
@socket_token_required
def handle_join(user_id, user_type, data):
    room_id = str(data.get('room_id'))
    join_room(room_id)    

@socketio.on('leave')
@socket_token_required
def handle_leave(user_id, user_type, data):
    room_id = str(data.get('room_id'))
    leave_room(room_id)

@socketio.on('connect')
def handle_connect():
    token = request.args.get("token")
    if not token:
        disconnect()
        return
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["user_id"]
        user_type = payload["user_type"]

        room_name = f"user_{user_type}_{user_id}"
        join_room(room_name)
        print(f"[CONNECT] 유저 {room_name} 소켓 룸 연결됨")
    except jwt.InvalidTokenError:
        disconnect()

@socketio.on('disconnect')
def handle_disconnect():
    print("클라이언트 연결 해제됨")

@chat_bp.route("/<int:userId>/chat-room", methods=["GET"])
@token_required
def get_chat_room_list(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address,
        "userimg": userInfo.img
    }
    
    rooms = db.session.query(Chatroom).filter(
        or_(
            and_(Chatroom.user1type == user_type, Chatroom.user1id == decoded_user_id),
            and_(Chatroom.user2type == user_type, Chatroom.user2id == decoded_user_id)
        )
    ).all()

    chat_room_list = []

    for room in rooms:
        # 상대방 정보 파악
        if room.user1type == user_type and room.user1id == decoded_user_id:
            else_type = room.user2type
            else_id = room.user2id
        else:
            else_type = room.user1type
            else_id = room.user1id

        # 상대방 정보 가져오기
        if else_type == UserType.PERSONAL.value:
            other = db.session.query(Personal).filter_by(pid=else_id).first()
        elif else_type == UserType.COMMERCIAL.value:
            other = db.session.query(Commercial).filter_by(cid=else_id).first()
        else:
            continue  # 유효하지 않은 사용자 타입일 경우 생략

        # 최근 메시지 조회
        last_message = (
            db.session.query(Chatmessage)
            .filter_by(chid=room.chid)
            .order_by(Chatmessage.createAt.desc())
            .first()
        )

        chat_room_list.append({
            "roomId": room.chid,
            "elseId": else_id,
            "elseType": else_type,
            "elseName": other.name if other else None,
            "elseNickname": other.nickname if other else None,
            "elseimg": other.img if other else None,
            "lastMessage": last_message.message if last_message else None,
            "lastMessageTime": last_message.createAt.isoformat() if last_message else None
        })

    return jsonify({"user_info": user_info, "chat_room_list": chat_room_list}), 200

@chat_bp.route("/<int:userId>/chat-room/<int:elseType>/<int:elseId>", methods=["GET"])
@token_required
def get_or_create_chat_room(decoded_user_id, user_type, userId, elseType, elseId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address,
        "userimg": userInfo.img
    }
    
    room = db.session.query(Chatroom).filter(
        or_(
            and_(Chatroom.user1type == user_type, Chatroom.user1id == decoded_user_id, Chatroom.user2type == elseType, Chatroom.user2id == elseId),
            and_(Chatroom.user1type == elseType, Chatroom.user1id == elseId, Chatroom.user2type == user_type, Chatroom.user2id == decoded_user_id)
        )
    ).first()

    if not room:
        room = Chatroom(user1type=user_type, user1id=decoded_user_id, user2type=elseType, user2id=elseId)
        db.session.add(room)
        db.session.commit()

        new_room_id = room.chid
        invited_user_id = elseId
        invited_user_type = elseType

        socketio.emit('new_chat_room', {
            "room_id": new_room_id,
            "else_id": invited_user_id,
            "else_type": invited_user_type,
        }, to=f"user_{invited_user_type}_{invited_user_id}")
    

    return jsonify({"roomId": room.chid, "user_info": user_info})

@chat_bp.route("/<int:userId>/chat-room/<int:roomId>", methods=["GET"])
@token_required
def get_messages(decoded_user_id, user_type, userId, roomId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address,
        "userimg": userInfo.img
    }
    
    room = db.session.query(Chatroom).filter(Chatroom.chid==roomId).first()

    if not room:
        return jsonify({"error": "존재하지 않는 채팅방"}), 404
    
    otherInfo = {}
    message_list = []
    
    if room.user1type == user_type and room.user1id == decoded_user_id:
        else_type = room.user2type
        else_id = room.user2id
    elif room.user2type == user_type and room.user2id == decoded_user_id:
        else_type = room.user1type
        else_id = room.user1id
    else:
        return jsonify({"error": "권한이 없습니다."}), 403

    # 상대방 정보 가져오기
    if else_type == UserType.PERSONAL.value:
        other = db.session.query(Personal).filter_by(pid=else_id).first()
    elif else_type == UserType.COMMERCIAL.value:
        other = db.session.query(Commercial).filter_by(cid=else_id).first()
    else:
        other = None
    
    messages = db.session.query(Chatmessage).filter(Chatmessage.chid==roomId).order_by(Chatmessage.createAt.asc()).all()

    message_list = ([
        {
            "cmid": msg.cmid,
            "sender_id": msg.senderid,
            "sender_type": msg.senderType,
            "message": msg.message,
            "image_url": msg.img,
            "createAt": msg.createAt.isoformat()
        }
        for msg in messages
    ])

    if other:
        otherInfo = {
            "otherId": else_id,
            "otherType": else_type,
            "otherName": other.name,
            "otherNickname": other.nickname,
            "elseimg": other.img,
        }
    
    return jsonify({"user_info": user_info, "other_info": otherInfo, "message_list": message_list}), 200

@chat_bp.route("/<int:userId>/chat-room/<int:roomId>/out", methods=["DELETE"])
@token_required
def leave_chat_room(decoded_user_id, user_type, userId, roomId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address,
        "userimg": userInfo.img
    }
    
    room = db.session.query(Chatroom).filter(Chatroom.chid==roomId).first()

    if not room:
        return jsonify({"error": "존재하지 않는 채팅방"}), 404
    
    if room.user1type == user_type and room.user1id == decoded_user_id:
        room.user1type = None
        room.user1id = None
    elif room.user2type == user_type and room.user2id == decoded_user_id:
        room.user2type = None
        room.user2id = None
    else:
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if (room.user1id == None) and (room.user2id == None) and (room.user1type == None) and (room.user2type == None):
        db.session.query(Chatroom).filter(Chatroom.chid==roomId).delete()
    
    db.session.commit()

    # 채팅방 나간 후 채팅방 리스트 화면을 띄울 수 있게 데이터 구성
    rooms = db.session.query(Chatroom).filter(
        or_(
            and_(Chatroom.user1type == user_type, Chatroom.user1id == decoded_user_id),
            and_(Chatroom.user2type == user_type, Chatroom.user2id == decoded_user_id)
        )
    ).all()

    chat_room_list = []

    for chatroom in rooms:
        # 상대방 정보 파악
        if chatroom.user1type == user_type and chatroom.user1id == decoded_user_id:
            else_type = chatroom.user2type
            else_id = chatroom.user2id
        else:
            else_type = chatroom.user1type
            else_id = chatroom.user1id

        # 상대방 정보 가져오기
        if else_type == UserType.PERSONAL.value:
            other = db.session.query(Personal).filter_by(pid=else_id).first()
        elif else_type == UserType.COMMERCIAL.value:
            other = db.session.query(Commercial).filter_by(cid=else_id).first()
        else:
            continue  # 유효하지 않은 사용자 타입일 경우 생략

        # 최근 메시지 조회
        last_message = (
            db.session.query(Chatmessage)
            .filter_by(chid=chatroom.chid)
            .order_by(Chatmessage.createAt.desc())
            .first()
        )

        chat_room_list.append({
            "roomId": chatroom.chid,
            "elseId": else_id,
            "elseType": else_type,
            "elseName": other.name if other else None,
            "elseNickname": other.nickname if other else None,
            "elseimg": other.img if other else None,
            "lastMessage": last_message.message if last_message else None,
            "lastMessageTime": last_message.createAt.isoformat() if last_message else None
        })

    socketio.emit('user_left', {
        "room_id": roomId,
        "user_id": decoded_user_id
    }, room=str(roomId))

    return jsonify({"user_info": user_info, "chat_room_list": chat_room_list}), 200

@chat_bp.route("/<int:userId>/chat-room/<int:roomId>/send", methods=["POST"])
@token_required
def send_message(decoded_user_id, user_type, userId, roomId):
    data = request.form
    message = data.get("message", "")
    image_file = request.files.get("image")

    if not message and not image_file:
        return jsonify({"error": "빈 메시지 또는 이미지가 필요합니다."}), 400

    if decoded_user_id != userId:
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 유저"}), 404
    
    room = db.session.query(Chatroom).filter(Chatroom.chid==roomId).first()

    if not room:
        return jsonify({"error": "존재하지 않는 채팅방"}), 404

    image_url = None
    if image_file:
        filename = secure_filename(f"{uuid4().hex}_{image_file.filename}")
        image_path = os.path.join(CHAT_IMG_UPLOAD_FOLDER, filename)
        image_file.save(image_path)
        image_url = f"/{CHAT_IMG_UPLOAD_FOLDER}/{filename}"

    chat_msg = Chatmessage(
        chid=roomId,
        senderid=decoded_user_id,
        senderType=user_type,
        message=message,
        img=image_url
    )
    db.session.add(chat_msg)
    db.session.commit()

    # 실시간 전송
    socketio.emit('receive_message', {
        "room_id": roomId,
        "sender_id": decoded_user_id,
        "sender_type": user_type,
        "sender_nickname": userInfo.nickname,
        "sender_img": userInfo.img,
        "message": message,
        "image_url": image_url,
        "createAt": chat_msg.createAt.isoformat()
    }, room=str(roomId))

    return jsonify({"success": True, "message_id": chat_msg.cmid}), 201