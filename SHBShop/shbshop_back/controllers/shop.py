from flask import Blueprint, request, jsonify
from enum import Enum
from sqlalchemy import desc, and_, or_
from sqlalchemy.orm import joinedload
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Favorite4p, Favorite4c
from extensions import db

shop_bp = Blueprint("shop", __name__)

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class Favorite(Enum):
    YES = 1
    NO = 2

@shop_bp.route("/<int:userId>/<int:shopId>", methods=["GET"])
@token_required
def show_shop_main_page(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    shop = db.session.query(Shop).filter_by(sid=shopId).first()

    if not shop:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    if user_type == UserType.PERSONAL.value:
        favoriteInfo = db.session.query(Favorite4p).filter_by(sid=shopId, pid=userId).first()
    elif user_type == UserType.COMMERCIAL.value:
        favoriteInfo = db.session.query(Favorite4c).filter_by(sid=shopId, cid=userId).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    if not favoriteInfo:
        isFavorite = Favorite.No.value
    else:
        isFavorite = Favorite.YES.value

    shopInfo = {
                    "shopId": shop.sid,
                    "presidentName": shop.presidentName,
                    "shopName": shop.shopName,
                    "shoptel": shop.shoptel,
                    "address": shop.address,
                    "open": shop.open,
                    "close": shop.close,
                    "holiday": shop.holiday,
                    "etc": shop.etc,
                    "shopimg1": shop.shopimg1,
                    "shopimg2": shop.shopimg2,
                    "shopimg3": shop.shopimg3
                }

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "isFavorite": isFavorite,
        "shop": shopInfo
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/search-book", methods=["GET"])
@token_required
def search_sbook_in_shop(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")

    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400
    
    shop = db.session.query(Shop).filter_by(sid=shopId).first()

    if not shop:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404

    keyword_pattern = f"%{keyword}%"

    sbook_results = (
        db.session.query(Sbooktrade)
            .filter(
                and_(
                        Sbooktrade.sid == shopId,
                        or_(
                            Sbooktrade.title.ilike(keyword_pattern),
                            Sbooktrade.author.ilike(keyword_pattern),
                            Sbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
            )
            .order_by(desc(Sbooktrade.createAt))
            .all()
        )
    
    sbook_list = [{
        "bid": book.bid,
        "title": book.title,
        "author": book.author,
        "publish": book.publish,
        "price": book.price,
        "region": book.region,
        "bookimg": book.img1,
        "shopName": shop.shopName,
        "createAt": book.createAt.isoformat()
    } for book in sbook_results]

    if not sbook_list:
        return jsonify({"message": "검색 결과가 없습니다.", "sbookList": []}), 200

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "shopId": shopId,
        "sbookList": sbook_list
    }), 200