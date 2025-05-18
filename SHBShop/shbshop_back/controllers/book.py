from flask import Blueprint, request, jsonify
from enum import Enum
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Pbasket2p, Pbasket2c, Pbasket2s, Cbasket2p, Cbasket2c, Cbasket2s
from extensions import db

book_bp = Blueprint("book", __name__)

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

@book_bp.route("/pb/<int:userId>/<int:sellerType>/<int:bookId>", methods=["GET"])
@token_required
def show_book_info(decoded_user_id, user_type, userId, sellerType, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    if sellerType == UserType.PERSONAL.value:
        book = db.session.query(Pbooktrade).filter_by(bid=bookId).first()
        seller = db.session.query(Personal).filter_by(pid=book.pid).first()
    elif sellerType == UserType.COMMERCIAL.value:
        book = db.session.query(Cbooktrade).filter_by(bid=bookId).first()
        seller = db.session.query(Commercial).filter_by(cid=book.cid).first()
    else:
        return jsonify({"error": "잘못된 셀러 유형"}), 404
    
    if not book:
        return jsonify({"error": "해당 책이 존재하지 않습니다."}), 404
    
    if not seller:
        return jsonify({"error": "판매자 정보가 존재하지 않습니다."}), 404
    
    bookInfo = {
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "detail": book.detail,
                "region": book.region,
                "bookimg1": book.img1,
                "bookimg2": book.img2,
                "bookimg3": book.img3,
                "createAt": book.createAt.isoformat(),
                "userType": sellerType
            }
    
    sellerInfo = {
                "name": seller.name,
                "tel": seller.tel,
                "nickname": seller.nickname,
                "region": seller.region,
                "img": seller.img,
                "userType": sellerType
            }
    
    if sellerType == UserType.PERSONAL.value:
        sellerInfo["sellerId"] = seller.pid
    elif sellerType == UserType.COMMERCIAL.value:
        sellerInfo["sellerId"] = seller.cid
    else:
        return jsonify({"error": "잘못된 셀러 유형"}), 404

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "region": userInfo.region,
        "seller": sellerInfo,
        "book": bookInfo
    }), 200

@book_bp.route("/sb/<int:userId>/<int:shopId>/<int:bookId>", methods=["GET"])
@token_required
def show_sbook_info(decoded_user_id, user_type, userId, shopId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    book = db.session.query(Sbooktrade).filter_by(bid=bookId).first()
    shop = db.session.query(Shop).filter_by(sid=book.sid).first()
    seller = db.session.query(Commercial).filter_by(cid=shop.cid).first()
    
    if not book:
        return jsonify({"error": "해당 책이 존재하지 않습니다."}), 404
    
    if not seller:
        return jsonify({"error": "판매자 정보가 존재하지 않습니다."}), 404
    
    if not shop:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    bookInfo = {
                "bid": book.bid,
                "sid": book.sid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "detail": book.detail,
                "region": book.region,
                "bookimg1": book.img1,
                "bookimg2": book.img2,
                "bookimg3": book.img3,
                "createAt": book.createAt.isoformat(),
                "userType": UserType.COMMERCIAL.value
            }
    
    sellerInfo = {
                "name": seller.name,
                "tel": seller.tel,
                "nickname": seller.nickname,
                "region": seller.region,
                "img": seller.img,
                "userType": UserType.COMMERCIAL.value
            }
    
    shopInfo = {
                "shopName": shop.shopName,
                "shoptel": shop.shoptel,
                "address": shop.address,
                "region": shop.region,
            }

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "region": userInfo.region,
        "seller": sellerInfo,
        "book": bookInfo,
        "shop": shopInfo
    }), 200

@book_bp.route("/pb/<int:userId>/<int:sellerType>/<int:bookId>/add-basket", methods=["POST"])
@token_required
def add_bk_in_basket(decoded_user_id, user_type, userId, sellerType, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if (user_type == UserType.PERSONAL.value) and (sellerType == UserType.PERSONAL.value):
        basketInfo = db.session.query(Pbasket2p).filter_by(pid=userId, bid=bookId).first()
        bookInfo = db.session.query(Pbooktrade).filter_by(bid=bookId).first()
        new_basket = Pbasket2p(pid=decoded_user_id, bid=bookId, sellerid=bookInfo.pid)
    elif (user_type == UserType.PERSONAL.value) and (sellerType == UserType.COMMERCIAL.value):
        basketInfo = db.session.query(Pbasket2c).filter_by(pid=userId, bid=bookId).first()
        bookInfo = db.session.query(Cbooktrade).filter_by(bid=bookId).first()
        new_basket = Pbasket2c(pid=decoded_user_id, bid=bookId, sellerid=bookInfo.cid)
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.PERSONAL.value):
        basketInfo = db.session.query(Cbasket2p).filter_by(cid=userId, bid=bookId).first()
        bookInfo = db.session.query(Pbooktrade).filter_by(bid=bookId).first()
        new_basket = Cbasket2p(cid=decoded_user_id, bid=bookId, sellerid=bookInfo.pid)
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.COMMERCIAL.value):
        basketInfo = db.session.query(Cbasket2c).filter_by(cid=userId, bid=bookId).first()
        bookInfo = db.session.query(Cbooktrade).filter_by(bid=bookId).first()
        new_basket = Cbasket2c(cid=decoded_user_id, bid=bookId, sellerid=bookInfo.cid)
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    if not bookInfo:
        return jsonify({"error": "존재하지 않는 도서"}), 404
    
    if basketInfo:
        return jsonify({"error": "이미 장바구니에 추가되어 있음"}), 409

    db.session.add(new_basket)
    db.session.commit()
    return jsonify({"message": "장바구니 추가 성공", "decoded_user_id": decoded_user_id, "user_type": user_type}), 201

@book_bp.route("/pb/<int:userId>/<int:sellerType>/<int:bookId>/delete-basket", methods=["DELETE"])
@token_required
def delete_bk_in_basket(decoded_user_id, user_type, userId, sellerType, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if (user_type == UserType.PERSONAL.value) and (sellerType == UserType.PERSONAL.value):
        basketInfo = db.session.query(Pbasket2p).filter_by(pid=userId, bid=bookId).first()
    elif (user_type == UserType.PERSONAL.value) and (sellerType == UserType.COMMERCIAL.value):
        basketInfo = db.session.query(Pbasket2c).filter_by(pid=userId, bid=bookId).first()
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.PERSONAL.value):
        basketInfo = db.session.query(Cbasket2p).filter_by(cid=userId, bid=bookId).first()
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.COMMERCIAL.value):
        basketInfo = db.session.query(Cbasket2c).filter_by(cid=userId, bid=bookId).first()
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    if not basketInfo:
        return jsonify({"error": "장바구니에 없는 책"}), 404
    
    try:
        db.session.delete(basketInfo)
        db.session.commit()
        return jsonify({
            "message": "장바구니 제거 성공",
            "decoded_user_id": decoded_user_id,
            "user_type": user_type
        }), 200
    except Exception as e:
        db.session.rollback()
        print(str(e))  # 또는 로그에 기록
        return jsonify({"error": str(e)}), 500

@book_bp.route("/sb/<int:userId>/<int:shopId>/<int:bookId>/add-basket", methods=["POST"])
@token_required
def add_sbk_in_basket(decoded_user_id, user_type, userId, shopId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    shopInfo = db.session.query(Shop).filter_by(sid=shopId).first()
    bookInfo = db.session.query(Sbooktrade).filter_by(bid=bookId).first()

    if not shopInfo:
        return jsonify({"error": "존재하지 않는 매장"}), 404

    if not bookInfo:
        return jsonify({"error": "존재하지 않는 도서"}), 404
    
    if bookInfo.sid != shopId:
        return jsonify({"error": "매장 정보와 도서 정보가 일치하지 않습니다."}), 400
    
    if (user_type == UserType.PERSONAL.value):
        basketInfo = db.session.query(Pbasket2s).filter_by(pid=userId, bid=bookId).first()
        new_basket = Pbasket2s(pid=decoded_user_id, bid=bookId, shopid=bookInfo.sid)
    elif (user_type == UserType.COMMERCIAL.value):
        basketInfo = db.session.query(Cbasket2s).filter_by(cid=userId, bid=bookId).first()
        new_basket = Cbasket2s(cid=decoded_user_id, bid=bookId, shopid=bookInfo.sid)
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    if basketInfo:
        return jsonify({"error": "이미 장바구니에 추가되어 있음"}), 409

    db.session.add(new_basket)
    db.session.commit()
    return jsonify({"message": "장바구니 추가 성공", "decoded_user_id": decoded_user_id, "user_type": user_type}), 201

@book_bp.route("/sb/<int:userId>/<int:shopId>/<int:bookId>/delete-basket", methods=["DELETE"])
@token_required
def delete_sbk_in_basket(decoded_user_id, user_type, userId, shopId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    shopInfo = db.session.query(Shop).filter_by(sid=shopId).first()
    bookInfo = db.session.query(Sbooktrade).filter_by(bid=bookId).first()

    if not shopInfo:
        return jsonify({"error": "존재하지 않는 매장"}), 404

    if not bookInfo:
        return jsonify({"error": "존재하지 않는 도서"}), 404
    
    if bookInfo.sid != shopId:
        return jsonify({"error": "매장 정보와 도서 정보가 일치하지 않습니다."}), 400
    
    if (user_type == UserType.PERSONAL.value):
        basketInfo = db.session.query(Pbasket2s).filter_by(pid=userId, bid=bookId).first()
    elif (user_type == UserType.COMMERCIAL.value):
        basketInfo = db.session.query(Cbasket2s).filter_by(cid=userId, bid=bookId).first()
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    if not basketInfo:
        return jsonify({"error": "장바구니에 없는 책"}), 404
    
    try:
        db.session.delete(basketInfo)
        db.session.commit()
        return jsonify({
            "message": "장바구니 제거 성공",
            "decoded_user_id": decoded_user_id,
            "user_type": user_type
        }), 200
    except Exception as e:
        db.session.rollback()
        print(str(e))  # 또는 로그에 기록
        return jsonify({"error": str(e)}), 500