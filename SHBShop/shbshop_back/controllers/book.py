from flask import Blueprint, request, jsonify
from enum import Enum
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop
from extensions import db

book_bp = Blueprint("book", __name__)

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

@book_bp.route("/<int:userId>/<int:sellerType>/<int:bookId>", methods=["GET"])
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

@book_bp.route("/<int:userId>/<int:shopId>/<int:bookId>", methods=["GET"])
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
    seller = db.session.query(Commercial).filter_by(cid=book.cid).first()
    shop = db.session.query(Shop).filter_by(sid=book.shopId).first()
    
    print(f"book.shopId: {book.shopId}, request.shopId: {shopId}")
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
                "region": seller.region,
            }

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "region": userInfo.region,
        "seller": sellerInfo,
        "book": bookInfo,
        "shop": shopInfo
    }), 200