from flask import Blueprint, jsonify, request
from enum import Enum
from sqlalchemy import desc
from utils.jwt_helper import token_required

from models import Commercial, Commercialcert, Modiaddress, Shop, Sbooktrade, Cbooktrade
from extensions import db

admin_bp = Blueprint("admin", __name__)

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class State(Enum):
    REVIEW = 1
    ACCEPT = 2
    REJECT = 3

@admin_bp.route("/check-licence", methods=["GET"])
@token_required
def check_licence_list(decoded_user_id, user_type):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403
    
    licenceList = db.session.query(Commercialcert).order_by(desc(Commercialcert.createAt)).all()

    licenceList_serialized = [
        {
            "idx": cert.idx,
            "cid": cert.cid,
            "name": cert.name,
            "presidentName": cert.presidentName,
            "businessmanName": cert.businessmanName,
            "birth": cert.birth,
            "tel": cert.tel,
            "email": cert.email,
            "businessEmail": cert.businessEmail,
            "address": cert.address,
            "coNumber": cert.coNumber,
            "licence": cert.licence,
            "reason": cert.reason,
            "state": cert.state,
            "createAt": cert.createAt.isoformat()
        }
        for cert in licenceList
    ]
    return jsonify({"message": "리스트 응답 성공", "licenceList": licenceList_serialized}), 200

@admin_bp.route("/check-licence/<int:licenceId>", methods=["GET"])
@token_required
def check_licence_info(decoded_user_id, user_type, licenceId):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403
    
    licenceInfo = db.session.query(Commercialcert).filter_by(idx=licenceId).first()

    licenceInfo_serialized = \
    {
        "idx": licenceInfo.idx,
        "cid": licenceInfo.cid,
        "name": licenceInfo.name,
        "presidentName": licenceInfo.presidentName,
        "businessmanName": licenceInfo.businessmanName,
        "birth": licenceInfo.birth,
        "tel": licenceInfo.tel,
        "email": licenceInfo.email,
        "businessEmail": licenceInfo.businessEmail,
        "address": licenceInfo.address,
        "coNumber": licenceInfo.coNumber,
        "bankname": licenceInfo.bankname,
        "bankaccount": licenceInfo.bankaccount,
        "licence": licenceInfo.licence,
        "accountPhoto": licenceInfo.accountPhoto,
        "reason": licenceInfo.reason,
        "state": licenceInfo.state,
        "createAt": licenceInfo.createAt.isoformat()
    }
    return jsonify({"message": "승인 요청 정보 응답 성공", "licenceInfo": licenceInfo_serialized}), 200

@admin_bp.route("/check-licence/<int:licenceId>/review", methods=["PUT"])
@token_required
def review_licence(decoded_user_id, user_type, licenceId):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403

    data = request.get_json()

    decision = data.get("decision")
    reason = data.get("reason")

    try:
        decision = int(decision)
    except (TypeError, ValueError):
        return jsonify({"error": "유효하지 않은 결정 값입니다."}), 400
    
    licenceInfo = db.session.query(Commercialcert).filter_by(idx=licenceId).first()
    if not licenceInfo:
        return jsonify({"error": "해당 인증 요청을 찾을 수 없습니다."}), 404
    coUser = db.session.query(Commercial).filter_by(cid = licenceInfo.cid).first()
    if not coUser:
        return jsonify({"error": "해당 상업회원 정보를 찾을 수 없습니다."}), 404


    if decision == State.ACCEPT.value:
        coUser.state = 2
        licenceInfo.state = 2
    elif decision == State.REJECT.value:
        coUser.state = 3
        licenceInfo.state = 3
    else:
        return jsonify({"error": "유효하지 않은 결정"}), 404
    
    licenceInfo.reason = reason

    db.session.commit()

    licenceList = db.session.query(Commercialcert).order_by(desc(Commercialcert.createAt)).all()

    licenceList_serialized = [
        {
            "idx": cert.idx,
            "cid": cert.cid,
            "name": cert.name,
            "presidentName": cert.presidentName,
            "businessmanName": cert.businessmanName,
            "birth": cert.birth,
            "tel": cert.tel,
            "email": cert.email,
            "businessEmail": cert.businessEmail,
            "address": cert.address,
            "coNumber": cert.coNumber,
            "licence": cert.licence,
            "reason": cert.reason,
            "state": cert.state,
            "createAt": cert.createAt.isoformat()
        }
        for cert in licenceList
    ]
    return jsonify({"message": "인증 요청 응답 성공", "licenceList": licenceList_serialized}), 200

@admin_bp.route("/check-modi-address", methods=["GET"])
@token_required
def check_modiReq_list(decoded_user_id, user_type):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403
    
    modiReqList = db.session.query(Modiaddress).order_by(desc(Modiaddress.idx)).all()

    if not modiReqList:
        return jsonify({"message": "요청 목록이 없습니다.", "modiReqList": []}), 200

    modiReqList_serialized = [
        {
            "idx": modiReq.idx,
            "cid": modiReq.cid,
            "name": modiReq.name,
            "presidentName": modiReq.presidentName,
            "businessmanName": modiReq.businessmanName,
            "businessEmail": modiReq.businessEmail,
            "address": modiReq.address,
            "coNumber": modiReq.coNumber,
            "licence": modiReq.licence,
            "reason": modiReq.reason,
            "state": modiReq.state,
            "createAt": modiReq.createAt.isoformat()
        }
        for modiReq in modiReqList
    ]
    return jsonify({"message": "리스트 응답 성공", "modiReqList": modiReqList_serialized}), 200

@admin_bp.route("/check-modi-address/<int:idx>", methods=["GET"])
@token_required
def check_modiReq_info(decoded_user_id, user_type, idx):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403
    
    if idx <= 0:
        return jsonify({"error": "잘못된 신청서 번호입니다."}), 400
    
    modiReqInfo = db.session.query(Modiaddress).filter_by(idx=idx).first()

    if not modiReqInfo:
        return jsonify({"error": "존재하지 않는 업장 변경 신청서"}), 404

    licenceInfo_serialized = \
    {
        "idx": modiReqInfo.idx,
        "cid": modiReqInfo.cid,
        "name": modiReqInfo.name,
        "presidentName": modiReqInfo.presidentName,
        "businessmanName": modiReqInfo.businessmanName,
        "businessEmail": modiReqInfo.businessEmail,
        "address": modiReqInfo.address,
        "coNumber": modiReqInfo.coNumber,
        "licence": modiReqInfo.licence,
        "reason": modiReqInfo.reason,
        "state": modiReqInfo.state,
        "createAt": modiReqInfo.createAt.isoformat()
    }
    return jsonify({"message": "승인 요청 정보 응답 성공", "licenceInfo": licenceInfo_serialized}), 200

@admin_bp.route("/check-modi-address/<int:idx>/review", methods=["PUT"])
@token_required
def review_modiReq(decoded_user_id, user_type, idx):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403

    data = request.get_json()

    decision = data.get("decision")
    reason = data.get("reason")

    try:
        decision = int(decision)
    except (TypeError, ValueError):
        return jsonify({"error": "유효하지 않은 결정 값입니다."}), 400
    
    modiReq = db.session.query(Modiaddress).filter_by(idx=idx).first()
    if not modiReq:
        return jsonify({"error": "존재하지 않는 업장 변경 신청서"}), 404
    coUser = db.session.query(Commercial).filter_by(cid = modiReq.cid).first()
    if not coUser:
        return jsonify({"error": "해당 상업회원 정보를 찾을 수 없습니다."}), 404
    exShop = db.session.query(Shop).filter_by(cid = modiReq.cid).first()


    if decision == State.ACCEPT.value:
        modiReq.state = 2

        coUser.address = modiReq.address
        try:
            parts = modiReq.address.split()
            coUser.region = parts[0] + "-" + parts[1]
        except IndexError:
            return jsonify({"error": "잘못된 주소 양식입니다."}), 400
        coUser.licence = modiReq.licence
        coUser.presidentName = modiReq.presidentName
        coUser.businessmanName = modiReq.businessmanName
        coUser.businessEmail = modiReq.businessEmail
        coUser.coNumber = modiReq.coNumber

        exShop.address = modiReq.address
        exShop.region = parts[0] + "-" + parts[1]
        exShop.licence = modiReq.licence
        exShop.presidentName = modiReq.presidentName
        exShop.businessmanName = modiReq.businessmanName
        exShop.businessEmail = modiReq.businessEmail
        exShop.coNumber = modiReq.coNumber

        new_certReq = Commercialcert(
            name = coUser.name,
            presidentName = modiReq.presidentName,
            businessmanName = modiReq.businessmanName,
            birth = coUser.birth,
            tel = coUser.tel,
            email = coUser.email,
            businessEmail = modiReq.businessEmail,
            address = modiReq.address,
            coNumber = modiReq.coNumber,
            licence=modiReq.licence,
            cid=coUser.cid,
            reason = reason,
            state = 2
        )

        db.session.add(new_certReq)

        db.session.query(Cbooktrade).filter_by(cid=coUser.cid).update({"region": parts[0] + "-" + parts[1]})
        db.session.query(Sbooktrade).filter_by(sid=exShop.sid).update({"region": parts[0] + "-" + parts[1]})

    elif decision == State.REJECT.value:
        modiReq.state = 3
    else:
        return jsonify({"error": "유효하지 않은 결정"}), 404
    
    modiReq.reason = reason

    db.session.commit()

    modiReqList = db.session.query(Modiaddress).order_by(desc(Modiaddress.idx)).all()

    modiReqList_serialized = [
        {
            "idx": modi.idx,
            "cid": modi.cid,
            "name": modi.name,
            "presidentName": modi.presidentName,
            "businessmanName": modi.businessmanName,
            "businessEmail": modi.businessEmail,
            "address": modi.address,
            "coNumber": modi.coNumber,
            "licence": modi.licence,
            "reason": modi.reason,
            "state": modi.state,
            "createAt": modi.createAt.isoformat()
        }
        for modi in modiReqList
    ]
    return jsonify({"message": "업장 변경 요청 응답 성공", "modiReqList": modiReqList_serialized}), 200