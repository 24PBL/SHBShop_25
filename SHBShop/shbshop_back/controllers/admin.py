from flask import Blueprint, jsonify, request
from enum import Enum
from sqlalchemy import desc
import os
from werkzeug.utils import secure_filename
from uuid import uuid4
from datetime import datetime
import pytz
from utils.jwt_helper import token_required
from dotenv import load_dotenv

from models import Commercial, Commercialcert, Modiaddress, Shop, Sbooktrade, Cbooktrade, Pbooktrade, Ppayment, Cpayment, Spayment, Personal
from extensions import db

admin_bp = Blueprint("admin", __name__)

load_dotenv()

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class State(Enum):
    REVIEW = 1
    ACCEPT = 2
    REJECT = 3

class PurchaseState(Enum):
    ONSALE = 1 #판매중
    PAYMENT_SUCCESS = 2 #결제완료
    #SELLER_REJECTED = 3 #판매거절
    #SELLER_CONFIRMED = 4 #판매승인
    #PURCHASE_CONFIRMED = 5 #구매확정
    USER_CANCELLED = 6 #사용자취소
    REFUNDED = 7 #환불완료
    PAYMENT_FAILED = 8 #결제실패
    PENDING = 9 #결제진행중
    CALCULATE = 10 #정산 요청 중
    CALCULATED = 11 #정산 완료
    CALFAIL = 12 #정산실패(도서 상태에는 없음. 정산서 상태에만 해당)

PAYMENT_UPLOAD_FOLDER = "static/paymentphoto"

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

@admin_bp.route("/check-payment/pt", methods=["GET"])
@token_required
def show_payment_req_list(decoded_user_id, user_type):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403

    payment_group = []

    ppayment_results = (
        db.session.query(Ppayment)
        .order_by(Ppayment.createAt.desc())
        .all()
    )

    cpayment_results = (
        db.session.query(Cpayment)
        .order_by(Cpayment.createAt.desc())
        .all()
    )

    # 개인 회원 정산 목록
    for p in ppayment_results:
        user = db.session.query(Personal).filter_by(pid=p.pid).first()
        books = db.session.query(Pbooktrade).filter_by(ppid=p.ppid).all()
    
        book_list = []
        for book in books:
            book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "state": book.state,
                "createAt": book.createAt.isoformat(),
                "img": book.img1
            })

        payment_group.append({
            "pyid": p.ppid,
            "user_type": UserType.PERSONAL.value,
            "price": p.price,
            "state": p.state,
            "reason": p.reason,
            "createAt": p.createAt,
            "completedAt": p.completedAt.isoformat() if p.completedAt else None,
            "completePhoto": p.completePhoto if p.completePhoto else None,
            "name": user.name if user else None,
            "nickname": user.nickname if user else None,
            "email": user.email if user else None,
            "tel": user.tel if user else None,
            "bankname": user.bankname if user else None,
            "bankaccount": user.bankaccount if user else None,
            "books": book_list
        })

    # 사업자 회원 정산 목록
    for c in cpayment_results:
        user = db.session.query(Commercial).filter_by(cid=c.cid).first()
        books = db.session.query(Cbooktrade).filter_by(cpid=c.cpid).all()
    
        book_list = []
        for book in books:
            book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "state": book.state,
                "createAt": book.createAt.isoformat(),
                "img": book.img1
            })

        payment_group.append({
            "pyid": c.cpid,
            "user_type": UserType.COMMERCIAL.value,
            "price": c.price,
            "state": c.state,
            "reason": c.reason,
            "createAt": c.createAt,
            "completedAt": c.completedAt.isoformat() if c.completedAt else None,
            "completePhoto": c.completePhoto if c.completePhoto else None,
            "name": user.name if user else None,
            "nickname": user.nickname if user else None,
            "email": user.email if user else None,
            "tel": user.tel if user else None,
            "bankname": user.bankname if user else None,
            "bankaccount": user.bankaccount if user else None,
            "books": book_list
        })

    payment_group.sort(key=lambda x: x["createAt"], reverse=True)

    for item in payment_group:
        item["createAt"] = item["createAt"].isoformat()

    return jsonify({"payment_group": payment_group}), 200

@admin_bp.route("/check-payment/pt/<int:kind>/<int:idx>", methods=["GET"])
@token_required
def show_payment_req_detail(decoded_user_id, user_type, kind, idx):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403
    
    book_list = []
    
    if kind == UserType.PERSONAL.value:
        payment_result = db.session.query(Ppayment).filter(Ppayment.ppid == idx).first()

        if not payment_result:
            return jsonify({"error": "존재하지 않는 정산 신청"}), 404

        user = db.session.query(Personal).filter_by(pid=payment_result.pid).first()
        books = db.session.query(Pbooktrade).filter_by(ppid=payment_result.ppid).all()

        if not user:
            return jsonify({"error": "존재하지 않는 유저"}), 404

        payment_info = {
            "pyid": payment_result.ppid,
            "user_type": UserType.PERSONAL.value,
            "price": payment_result.price,
            "state": payment_result.state,
            "reason": payment_result.reason,
            "createAt": payment_result.createAt.isoformat(),
            "completedAt": payment_result.completedAt.isoformat() if payment_result.completedAt else None,
            "completePhoto": payment_result.completePhoto if payment_result.completePhoto else None,
            "name": user.name if user else None,
            "nickname": user.nickname if user else None,
            "email": user.email if user else None,
            "tel": user.tel if user else None,
            "bankname": user.bankname if user else None,
            "bankaccount": user.bankaccount if user else None,
        }
    elif kind == UserType.COMMERCIAL.value:
        payment_result = db.session.query(Cpayment).filter(Cpayment.cpid == idx).first()

        if not payment_result:
            return jsonify({"error": "존재하지 않는 정산 신청"}), 404

        user = db.session.query(Commercial).filter_by(cid=payment_result.cid).first()
        books = db.session.query(Cbooktrade).filter_by(cpid=payment_result.cpid).all()

        if not user:
            return jsonify({"error": "존재하지 않는 유저"}), 404
        
        payment_info = {
            "pyid": payment_result.cpid,
            "user_type": UserType.COMMERCIAL.value,
            "price": payment_result.price,
            "state": payment_result.state,
            "reason": payment_result.reason,
            "createAt": payment_result.createAt.isoformat(),
            "completedAt": payment_result.completedAt.isoformat() if payment_result.completedAt else None,
            "completePhoto": payment_result.completePhoto if payment_result.completePhoto else None,
            "name": user.name if user else None,
            "nickname": user.nickname if user else None,
            "email": user.email if user else None,
            "tel": user.tel if user else None,
            "bankname": user.bankname if user else None,
            "bankaccount": user.bankaccount if user else None,
        }
    else:
        return jsonify({"error": "잘못된 정산신청 타입"}), 403
    
    for book in books:
        book_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "state": book.state,
            "createAt": book.createAt.isoformat(),
            "img": book.img1
        })

    return jsonify({"payment_info": payment_info, "book_list": book_list}), 200

@admin_bp.route("/check-payment/pt/<int:kind>/<int:idx>/review", methods=["POST"])
@token_required
def show_payment_req_review(decoded_user_id, user_type, kind, idx):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403

    decision = request.form.get("decision")
    reason = request.form.get("reason")
    completePhoto = request.files.get("completePhoto")

    try:
        decision = int(decision)
    except (TypeError, ValueError):
        return jsonify({"error": "유효하지 않은 결정 값입니다."}), 400
    
    kst = pytz.timezone("Asia/Seoul")
    now_kst = datetime.now(kst)

    if kind == UserType.PERSONAL.value:
        payment_result = db.session.query(Ppayment).filter(Ppayment.ppid == idx).first()

        if not payment_result:
            return jsonify({"error": "존재하지 않는 정산 신청"}), 404

        user = db.session.query(Personal).filter_by(pid=payment_result.pid).first()
        books = db.session.query(Pbooktrade).filter_by(ppid=payment_result.ppid).all()

    elif kind == UserType.COMMERCIAL.value:
        payment_result = db.session.query(Cpayment).filter(Cpayment.cpid == idx).first()

        if not payment_result:
            return jsonify({"error": "존재하지 않는 정산 신청"}), 404

        user = db.session.query(Commercial).filter_by(cid=payment_result.cid).first()
        books = db.session.query(Cbooktrade).filter_by(cpid=payment_result.cpid).all()
    else:
        return jsonify({"error": "잘못된 정산신청 타입"}), 403
    
    if not user:
            return jsonify({"error": "존재하지 않는 유저"}), 404
    
    if decision == State.ACCEPT.value:
        if not completePhoto:
            return jsonify({"error": "정산 증빙 사진을 첨부해주세요."}), 400
        
        fail_book_list = []
        
        for book in books:
            if book.state != PurchaseState.CALCULATE.value:
                fail_book_list.append({
                    "bid": book.bid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "state": book.state,
                    "createAt": book.createAt.isoformat(),
                    "img": book.img1
                })
        
        if fail_book_list:
            return jsonify({"fail_book_list": fail_book_list, "error": "정산할 수 없는 책 존재"}), 403
        
        filename = secure_filename(f"{uuid4().hex}_{completePhoto.filename}")
        save_path1 = os.path.join(PAYMENT_UPLOAD_FOLDER, filename)
        try:
            completePhoto.save(save_path1)
            completePhoto_url = f"/{PAYMENT_UPLOAD_FOLDER}/{filename}"
        except Exception as e:
            return jsonify({"error": f"completePhoto 저장 실패: {str(e)}"}), 500
        
        payment_result.state = PurchaseState.CALCULATED.value
        payment_result.completePhoto = completePhoto_url

        for book in books:
            book.state = PurchaseState.CALCULATED.value
    elif decision == State.REJECT.value:
        payment_result.state = PurchaseState.CALFAIL.value

        for book in books:
            book.state = PurchaseState.PAYMENT_SUCCESS.value
    else:
        return jsonify({"error": "잘못된 결정값."}), 400
    
    payment_result.reason = reason
    payment_result.completedAt = now_kst

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"db 처리 실패: {str(e)}"}), 500    

    payment_group = []

    ppayment_results = (
        db.session.query(Ppayment)
        .order_by(Ppayment.createAt.desc())
        .all()
    )

    cpayment_results = (
        db.session.query(Cpayment)
        .order_by(Cpayment.createAt.desc())
        .all()
    )

    # 개인 회원 정산 목록
    for p in ppayment_results:
        after_user = db.session.query(Personal).filter_by(pid=p.pid).first()
        after_books = db.session.query(Pbooktrade).filter_by(ppid=p.ppid).all()
    
        book_list = []
        for book in after_books:
            book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "state": book.state,
                "createAt": book.createAt.isoformat(),
                "img": book.img1
            })

        payment_group.append({
            "pyid": p.ppid,
            "user_type": UserType.PERSONAL.value,
            "price": p.price,
            "state": p.state,
            "reason": p.reason,
            "createAt": p.createAt,
            "completedAt": p.completedAt.isoformat() if p.completedAt else None,
            "completePhoto": p.completePhoto if p.completePhoto else None,
            "name": after_user.name if after_user else None,
            "nickname": after_user.nickname if after_user else None,
            "email": after_user.email if after_user else None,
            "tel": after_user.tel if after_user else None,
            "bankname": after_user.bankname if after_user else None,
            "bankaccount": after_user.bankaccount if after_user else None,
            "books": book_list
        })

    # 사업자 회원 정산 목록
    for c in cpayment_results:
        after_user = db.session.query(Commercial).filter_by(cid=c.cid).first()
        after_books = db.session.query(Cbooktrade).filter_by(cpid=c.cpid).all()
    
        book_list = []
        for book in after_books:
            book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "state": book.state,
                "createAt": book.createAt.isoformat(),
                "img": book.img1
            })

        payment_group.append({
            "pyid": c.cpid,
            "user_type": UserType.COMMERCIAL.value,
            "price": c.price,
            "state": c.state,
            "reason": c.reason,
            "createAt": c.createAt,
            "completedAt": c.completedAt.isoformat() if c.completedAt else None,
            "completePhoto": c.completePhoto if c.completePhoto else None,
            "name": after_user.name if after_user else None,
            "nickname": after_user.nickname if after_user else None,
            "email": after_user.email if after_user else None,
            "tel": after_user.tel if after_user else None,
            "bankname": after_user.bankname if after_user else None,
            "bankaccount": after_user.bankaccount if after_user else None,
            "books": book_list
        })

    payment_group.sort(key=lambda x: x["createAt"], reverse=True)

    for item in payment_group:
        item["createAt"] = item["createAt"].isoformat()

    return jsonify({"payment_group": payment_group}), 200

@admin_bp.route("/check-payment/st", methods=["GET"])
@token_required
def show_spayment_req_list(decoded_user_id, user_type):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403

    payment_group = []

    spayment_results = (
        db.session.query(Spayment)
        .order_by(Spayment.createAt.desc())
        .all()
    )

    for s in spayment_results:
        shop = db.session.query(Shop).filter_by(sid=s.sid).first()
        user = db.session.query(Commercial).filter_by(cid=shop.cid).first()
        books = db.session.query(Sbooktrade).filter_by(spid=s.spid).all()
    
        book_list = []
        for book in books:
            book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "state": book.state,
                "createAt": book.createAt.isoformat(),
                "img": book.img1
            })

        payment_group.append({
            "pyid": s.spid,
            "price": s.price,
            "state": s.state,
            "reason": s.reason,
            "createAt": s.createAt.isoformat(),
            "completedAt": s.completedAt.isoformat() if s.completedAt else None,
            "completePhoto": s.completePhoto if s.completePhoto else None,
            "shopName": shop.shopName,
            "shoptel": shop.shoptel,
            "bankname": user.bankname if user else None,
            "bankaccount": user.bankaccount if user else None,
            "books": book_list
        })

    return jsonify({"payment_group": payment_group}), 200

@admin_bp.route("/check-payment/st/<int:idx>", methods=["GET"])
@token_required
def show_spayment_req_detail(decoded_user_id, user_type, idx):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403
    
    book_list = []

    payment_result = db.session.query(Spayment).filter(Spayment.spid == idx).first()

    if not payment_result:
        return jsonify({"error": "존재하지 않는 정산 신청"}), 404
    
    shop = db.session.query(Shop).filter_by(sid=payment_result.sid).first()
    if not shop:
        return jsonify({"error": "존재하지 않는 가게"}), 404

    user = db.session.query(Commercial).filter_by(cid=shop.cid).first()
    books = db.session.query(Sbooktrade).filter_by(spid=payment_result.spid).all()

    if not user:
        return jsonify({"error": "존재하지 않는 유저"}), 404

    payment_info = {
        "pyid": payment_result.spid,
        "price": payment_result.price,
        "state": payment_result.state,
        "reason": payment_result.reason,
        "createAt": payment_result.createAt.isoformat(),
        "completedAt": payment_result.completedAt.isoformat() if payment_result.completedAt else None,
        "completePhoto": payment_result.completePhoto if payment_result.completePhoto else None,
        "shopName": shop.shopName,
        "shoptel": shop.shoptel,
        "bankname": user.bankname if user else None,
        "bankaccount": user.bankaccount if user else None,
    }
   
    for book in books:
        book_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "state": book.state,
            "createAt": book.createAt.isoformat(),
            "img": book.img1
        })

    return jsonify({"payment_info": payment_info, "book_list": book_list}), 200

@admin_bp.route("/check-payment/st/<int:idx>/review", methods=["POST"])
@token_required
def show_spayment_req_review(decoded_user_id, user_type, idx):
    if user_type != UserType.ADMIN.value:
        return jsonify({"error": "관리자만 접근 가능"}), 403

    decision = request.form.get("decision")
    reason = request.form.get("reason")
    completePhoto = request.files.get("completePhoto")

    try:
        decision = int(decision)
    except (TypeError, ValueError):
        return jsonify({"error": "유효하지 않은 결정 값입니다."}), 400
    
    kst = pytz.timezone("Asia/Seoul")
    now_kst = datetime.now(kst)

    payment_result = db.session.query(Spayment).filter(Spayment.spid == idx).first()

    if not payment_result:
        return jsonify({"error": "존재하지 않는 정산 신청"}), 404
    
    shop = db.session.query(Shop).filter_by(sid=payment_result.sid).first()
    if not shop:
        return jsonify({"error": "존재하지 않는 가게"}), 404

    user = db.session.query(Commercial).filter_by(cid=shop.cid).first()
    books = db.session.query(Sbooktrade).filter_by(spid=payment_result.spid).all()

    if not user:
        return jsonify({"error": "존재하지 않는 유저"}), 404
    
    if decision == State.ACCEPT.value:
        if not completePhoto:
            return jsonify({"error": "정산 증빙 사진을 첨부해주세요."}), 400
        
        fail_book_list = []
        
        for book in books:
            if book.state != PurchaseState.CALCULATE.value:
                fail_book_list.append({
                    "bid": book.bid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "state": book.state,
                    "createAt": book.createAt.isoformat(),
                    "img": book.img1
                })
        
        if fail_book_list:
            return jsonify({"fail_book_list": fail_book_list, "error": "정산할 수 없는 책 존재"}), 403
        
        filename = secure_filename(f"{uuid4().hex}_{completePhoto.filename}")
        save_path1 = os.path.join(PAYMENT_UPLOAD_FOLDER, filename)
        try:
            completePhoto.save(save_path1)
            completePhoto_url = f"/{PAYMENT_UPLOAD_FOLDER}/{filename}"
        except Exception as e:
            return jsonify({"error": f"completePhoto 저장 실패: {str(e)}"}), 500
        
        payment_result.state = PurchaseState.CALCULATED.value
        payment_result.completePhoto = completePhoto_url

        for book in books:
            book.state = PurchaseState.CALCULATED.value
    elif decision == State.REJECT.value:
        payment_result.state = PurchaseState.CALFAIL.value

        for book in books:
            book.state = PurchaseState.PAYMENT_SUCCESS.value
    else:
        return jsonify({"error": "잘못된 결정값."}), 400
    
    payment_result.reason = reason
    payment_result.completedAt = now_kst

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"db 처리 실패: {str(e)}"}), 500    

    payment_group = []

    spayment_results = (
        db.session.query(Spayment)
        .order_by(Spayment.createAt.desc())
        .all()
    )

    for s in spayment_results:
        after_shop = db.session.query(Shop).filter_by(sid=s.sid).first()
        after_user = db.session.query(Commercial).filter_by(cid=after_shop.cid).first()
        after_books = db.session.query(Sbooktrade).filter_by(spid=s.spid).all()
    
        book_list = []
        for book in after_books:
            book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "state": book.state,
                "createAt": book.createAt.isoformat(),
                "img": book.img1
            })

        payment_group.append({
            "pyid": s.spid,
            "price": s.price,
            "state": s.state,
            "reason": s.reason,
            "createAt": s.createAt.isoformat(),
            "completedAt": s.completedAt.isoformat() if s.completedAt else None,
            "completePhoto": s.completePhoto if s.completePhoto else None,
            "shopName": after_shop.shopName,
            "shoptel": after_shop.shoptel,
            "bankname": after_user.bankname if after_user else None,
            "bankaccount": after_user.bankaccount if after_user else None,
            "books": book_list
        })

    return jsonify({"payment_group": payment_group}), 200