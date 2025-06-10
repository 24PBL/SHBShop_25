from flask import Blueprint, request, jsonify
from enum import Enum
from sqlalchemy import desc, and_, or_
from sqlalchemy.orm import joinedload
import os
from werkzeug.utils import secure_filename
from uuid import uuid4
from werkzeug.security import generate_password_hash, check_password_hash
import random
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Favorite4p, Favorite4c, Commercialcert, Vaild4pmd, Vaild4cmd, Modiaddress, Pbasket2p, Pbasket2c, Pbasket2s, Cbasket2p, Cbasket2c, Cbasket2s, Preceipt2p, Preceipt2s, Creceipt2p, Creceipt2s, Ppayment, Cpayment 
from extensions import db

home_bp = Blueprint("home", __name__)

LICENCE_UPLOAD_FOLDER = "static/licence"
S_IMAGE_UPLOAD_FOLDER = "static/shop"
P_PROFILE_UPLOAD_FOLDER = "static/user/personal"
C_PROFILE_UPLOAD_FOLDER = "static/user/commercial"
PBOOK_UPLOAD_FOLDER = "static/product/personal"
CBOOK_UPLOAD_FOLDER = "static/product/commercial"
BANK_UPLOAD_FOLDER = "static/account"

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class CoUserType(Enum):
    JUSTUSER = 1
    SHOPUSER = 2

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

@home_bp.route("/<int:userId>", methods=["GET"])
@token_required
def show_user_home(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    pbook_results = (
        db.session.query(Pbooktrade, Personal.nickname)
        .join(Personal, Pbooktrade.pid == Personal.pid)
        .filter(Pbooktrade.region == userInfo.region, Pbooktrade.state == PurchaseState.ONSALE.value)
        .order_by(Pbooktrade.createAt.desc())
        .limit(5)
        .all()
    )

    cbook_results = (
        db.session.query(Cbooktrade, Commercial.nickname)
        .join(Commercial, Cbooktrade.cid == Commercial.cid)
        .filter(Cbooktrade.region == userInfo.region, Cbooktrade.state == PurchaseState.ONSALE.value)
        .order_by(Cbooktrade.createAt.desc())
        .limit(5)
        .all()
    )

    combined_list = []

    for book, nickname in pbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.PERSONAL.value
        })

    for book, nickname in cbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.COMMERCIAL.value
        })

    sorted_books = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

    for book in sorted_books:
        book["createAt"] = book["createAt"].isoformat()

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "region": userInfo.region,
        "bookList": sorted_books
    }), 200

@home_bp.route("/<int:userId>/<int:pfinidx>/<int:cfinidx>", methods=["GET"])
@token_required
def show_user_home_more(decoded_user_id, user_type, userId, pfinidx, cfinidx):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    pbook_results = (
        db.session.query(Pbooktrade, Personal.nickname)
        .join(Personal, Pbooktrade.pid == Personal.pid)
        .filter(
            Pbooktrade.region == userInfo.region,
            Pbooktrade.bid < pfinidx,
            Pbooktrade.state == PurchaseState.ONSALE.value
        )
        .order_by(Pbooktrade.createAt.desc())
        .limit(5)
        .all()
    )

    cbook_results = (
        db.session.query(Cbooktrade, Commercial.nickname)
        .join(Commercial, Cbooktrade.cid == Commercial.cid)
        .filter(
            Cbooktrade.region == userInfo.region,
            Cbooktrade.bid < cfinidx,
            Cbooktrade.state == PurchaseState.ONSALE.value
        )
        .order_by(Cbooktrade.createAt.desc())
        .limit(5)
        .all()
    )

    combined_list = []

    for book, nickname in pbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.PERSONAL.value
        })

    for book, nickname in cbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.COMMERCIAL.value
        })

    sorted_books = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

    for book in sorted_books:
        book["createAt"] = book["createAt"].isoformat()

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "region": userInfo.region,
        "bookList": sorted_books
    }), 200

@home_bp.route("/<int:userId>/search-book", methods=["GET"])
@token_required
def search_book(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    region = request.args.get("region")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400
    
    if not region:
        region = "noneRestriction"
    else:
        region_pattern = f"%{region}%"

    keyword_pattern = f"%{keyword}%"
    
    if region == "noneRestriction":
        pbook_results = (
            db.session.query(Pbooktrade, Personal.nickname)
                .join(Personal, Pbooktrade.pid == Personal.pid)
                .filter(
                    and_(
                        Pbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Pbooktrade.title.ilike(keyword_pattern),
                            Pbooktrade.author.ilike(keyword_pattern),
                            Pbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Pbooktrade.createAt))
                .limit(3)
                .all()
        )

        cbook_results = (
            db.session.query(Cbooktrade, Commercial.nickname)
                .join(Commercial, Cbooktrade.cid == Commercial.cid)
                .filter(
                    and_(
                        Cbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Cbooktrade.title.ilike(keyword_pattern),
                            Cbooktrade.author.ilike(keyword_pattern),
                            Cbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Cbooktrade.createAt))
                .limit(3)
                .all()
        )

        sbook_results = (
            db.session.query(Sbooktrade, Shop.shopName)
                .join(Shop, Sbooktrade.sid == Shop.sid)
                .filter(
                    and_(
                        Sbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Sbooktrade.title.ilike(keyword_pattern),
                            Sbooktrade.author.ilike(keyword_pattern),
                            Sbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Sbooktrade.createAt))
                .limit(6)
                .all()
        )
    else:
        pbook_results = (
            db.session.query(Pbooktrade, Personal.nickname)
                .join(Personal, Pbooktrade.pid == Personal.pid)
                .filter(
                    and_(
                        Pbooktrade.region.ilike(region_pattern),
                        Pbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Pbooktrade.title.ilike(keyword_pattern),
                            Pbooktrade.author.ilike(keyword_pattern),
                            Pbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Pbooktrade.createAt))
                .limit(3)
                .all()
        )

        cbook_results = (
            db.session.query(Cbooktrade, Commercial.nickname)
                .join(Commercial, Cbooktrade.cid == Commercial.cid)
                .filter(
                    and_(
                        Cbooktrade.region.ilike(region_pattern),
                        Cbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Cbooktrade.title.ilike(keyword_pattern),
                            Cbooktrade.author.ilike(keyword_pattern),
                            Cbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Cbooktrade.createAt))
                .limit(3)
                .all()
        )

        sbook_results = (
            db.session.query(Sbooktrade, Shop.shopName)
                .join(Shop, Sbooktrade.sid == Shop.sid)
                .filter(
                    and_(
                        Sbooktrade.region.ilike(region_pattern),
                        Sbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Sbooktrade.title.ilike(keyword_pattern),
                            Sbooktrade.author.ilike(keyword_pattern),
                            Sbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Sbooktrade.createAt))
                .limit(6)
                .all()
        )

    combined_list = []

    for book, nickname in pbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.PERSONAL.value
        })

    for book, nickname in cbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.COMMERCIAL.value
        })
    
    sbook_list = [{
        "bid": book.bid,
        "sid": book.sid,
        "title": book.title,
        "author": book.author,
        "publish": book.publish,
        "isbn": book.isbn,
        "price": book.price,
        "region": book.region,
        "bookimg": book.img1,
        "shopName": shopName,
        "createAt": book.createAt.isoformat()
    } for book, shopName in sbook_results]

    sorted_books = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

    for book in sorted_books:
        book["createAt"] = book["createAt"].isoformat()

    if not sorted_books and not sbook_list:
        return jsonify({"message": "검색 결과가 없습니다.", "bookList": [], "sbookList": []}), 200

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "bookList": sorted_books,
        "sbookList": sbook_list
    }), 200

@home_bp.route("/<int:userId>/search-book/more-book/<int:pfinidx>/<int:cfinidx>", methods=["GET"])
@token_required
def search_more_book(decoded_user_id, user_type, userId, pfinidx, cfinidx):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    region = request.args.get("region")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400
    
    if not region:
        region = "noneRestriction"
    else:
        region_pattern = f"%{region}%"

    keyword_pattern = f"%{keyword}%"

    if region == "noneRestriction":
        pbook_results = (
            db.session.query(Pbooktrade, Personal.nickname)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(
                Pbooktrade.bid < pfinidx,
                Pbooktrade.state == PurchaseState.ONSALE.value,
                or_(
                    Pbooktrade.title.ilike(keyword_pattern),
                    Pbooktrade.author.ilike(keyword_pattern),
                    Pbooktrade.publish.ilike(keyword_pattern)
                )
            )
            .order_by(desc(Pbooktrade.createAt))
            .limit(5)
            .all()
        )

        cbook_results = (
            db.session.query(Cbooktrade, Commercial.nickname)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(
                Cbooktrade.bid < cfinidx,
                Cbooktrade.state == PurchaseState.ONSALE.value,
                or_(
                        Cbooktrade.title.ilike(keyword_pattern),
                        Cbooktrade.author.ilike(keyword_pattern),
                        Cbooktrade.publish.ilike(keyword_pattern)
                    )
            )
            .order_by(desc(Cbooktrade.createAt))
            .limit(3)
            .all()
        )
    else:
        pbook_results = (
            db.session.query(Pbooktrade, Personal.nickname)
                .join(Personal, Pbooktrade.pid == Personal.pid)
                .filter(
                    and_(
                        Pbooktrade.bid < pfinidx,
                        Pbooktrade.region.ilike(region_pattern),
                        Pbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Pbooktrade.title.ilike(keyword_pattern),
                            Pbooktrade.author.ilike(keyword_pattern),
                            Pbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Pbooktrade.createAt))
                .limit(3)
                .all()
        )

        cbook_results = (
            db.session.query(Cbooktrade, Commercial.nickname)
                .join(Commercial, Cbooktrade.cid == Commercial.cid)
                .filter(
                    and_(
                        Cbooktrade.bid < cfinidx,
                        Cbooktrade.region.ilike(region_pattern),
                        Cbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Cbooktrade.title.ilike(keyword_pattern),
                            Cbooktrade.author.ilike(keyword_pattern),
                            Cbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Cbooktrade.createAt))
                .limit(5)
                .all()
        )

    combined_list = []

    for book, nickname in pbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.PERSONAL.value
        })

    for book, nickname in cbook_results:
        combined_list.append({
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.COMMERCIAL.value
        })
    
    sorted_books = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

    for book in sorted_books:
        book["createAt"] = book["createAt"].isoformat()

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "bookList": sorted_books,
    }), 200

@home_bp.route("/<int:userId>/search-book/more-sbook/<int:sfinidx>", methods=["GET"])
@token_required
def search_more_sbook(decoded_user_id, user_type, userId, sfinidx):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    region = request.args.get("region")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400
    
    if not region:
        region = "noneRestriction"
    else:
        region_pattern = f"%{region}%"

    keyword_pattern = f"%{keyword}%"
    
    if region == "noneRestriction":
        sbook_results = (
            db.session.query(Sbooktrade, Shop.shopName)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(
                Sbooktrade.bid < sfinidx,
                Sbooktrade.state == PurchaseState.ONSALE.value,
                or_(
                    Sbooktrade.title.ilike(keyword_pattern),
                    Sbooktrade.author.ilike(keyword_pattern),
                    Sbooktrade.publish.ilike(keyword_pattern)
                )
            )
            .order_by(desc(Sbooktrade.createAt))
            .limit(10)
            .all()
        )
    else:
        sbook_results = (
            db.session.query(Sbooktrade, Shop.shopName)
                .join(Shop, Sbooktrade.sid == Shop.sid)
                .filter(
                    and_(
                        Sbooktrade.bid < sfinidx,
                        Sbooktrade.region.ilike(region_pattern),
                        Sbooktrade.state == PurchaseState.ONSALE.value,
                        or_(
                            Sbooktrade.title.ilike(keyword_pattern),
                            Sbooktrade.author.ilike(keyword_pattern),
                            Sbooktrade.publish.ilike(keyword_pattern)
                        )
                    )
                )
                .order_by(desc(Sbooktrade.createAt))
                .limit(10)
                .all()
        )
    
    sbook_list = [{
        "bid": book.bid,
        "sid": book.sid,
        "title": book.title,
        "author": book.author,
        "publish": book.publish,
        "isbn": book.isbn,
        "price": book.price,
        "region": book.region,
        "bookimg": book.img1,
        "shopName": shopName,
        "createAt": book.createAt.isoformat()
    } for book, shopName in sbook_results]

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "sbookList": sbook_list
    }), 200

@home_bp.route("/<int:userId>/shop-mode/main", methods=["GET"])
@token_required
def get_shop_main(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    currentAddress = request.args.get("currentAddress")
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        favorite_results = (
            db.session.query(Favorite4p, Shop)
            .filter_by(pid=decoded_user_id)
            .join(Shop, Favorite4p.sid == Shop.sid)
            .order_by(Favorite4p.sid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        favorite_results = (
            db.session.query(Favorite4c, Shop)
            .filter_by(cid=decoded_user_id)
            .join(Shop, Favorite4c.sid == Shop.sid)
            .order_by(Favorite4c.sid.desc())
            .all()
        )
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    if currentAddress:
        currentRegion = currentAddress.split()[0] + "-" + currentAddress.split()[1]
    else:
        currentRegion = userInfo.region
    
    localShop = db.session.query(Shop).filter_by(region=currentRegion).all()

    localShop_list = [
        {
            "sid": shop.sid,
            "shopName": shop.shopName,
            "address": shop.address,
            "region": shop.region,
            "shoptel": shop.shoptel,
            "shopimg1": shop.shopimg1,
            "holiday": shop.holiday,
            "open": shop.open,
            "close": shop.close,
            "createAt": shop.createAt.isoformat()
        } for shop in localShop
    ]
    
    favorite_list = [
        {
            "sid": shop.sid,
            "shopName": shop.shopName,
            "address": shop.address,
            "region": shop.region,
            "shoptel": shop.shoptel,
            "shopimg1": shop.shopimg1,
            "holiday": shop.holiday,
            "open": shop.open,
            "close": shop.close,
            "createAt": shop.createAt.isoformat()
        } for _, shop in favorite_results
    ]

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "localShop_list": localShop_list,
        "favorite_list": favorite_list
    }), 200

@home_bp.route("/<int:userId>/shop-mode/search-shop", methods=["GET"])
@token_required
def search_shop(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400

    keyword_pattern = f"%{keyword}%"

    shop_results = (
        db.session.query(Shop)
        .filter(
            or_(
                Shop.shopName.ilike(keyword_pattern),
                Shop.address.ilike(keyword_pattern)
            )
        )
        .order_by(desc(Shop.sid))
        .all()
    )

    shop_list = [{
        "sid": shop.sid,
        "shopName": shop.shopName,
        "shoptel": shop.shoptel,
        "region": shop.region,
        "shopimg": shop.shopimg1,
        "createAt": shop.createAt.isoformat()
    } for shop in shop_results]

    if not shop_list:
        return jsonify({"message": "검색 결과가 없습니다.", "shopList": []}), 200

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "shopList": shop_list
    }), 200

@home_bp.route("/<int:userId>/shop-mode/<int:shopId>/add-shop", methods=["POST"])
@token_required
def add_favorite_shop(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sInfo = db.session.query(Shop).filter_by(sid=shopId).first()

    if not sInfo:
        return jsonify({"error": "일치하는 매장이 없습니다."}), 404
    
    if user_type == UserType.PERSONAL.value:
        pInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        exFav = db.session.query(Favorite4p).filter_by(pid=decoded_user_id, sid=shopId).first()

        if not pInfo:
            return jsonify({"error": "일치하는 회원이 없습니다."}), 404
        
        if exFav:
            return jsonify({"message": "이미 즐겨찾기에 추가된 매장입니다."}), 409
        
        new_favorite4p = Favorite4p(pid=decoded_user_id, sid = shopId)

        db.session.add(new_favorite4p)
        db.session.commit()
        return jsonify({"message": "즐겨찾기 추가 성공", "decoded_user_id": decoded_user_id, "user_type": user_type,}), 201
    elif user_type == UserType.COMMERCIAL.value:
        cInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        exFav = db.session.query(Favorite4c).filter_by(cid=decoded_user_id, sid=shopId).first()

        if not cInfo:
            return jsonify({"error": "일치하는 회원이 없습니다."}), 404

        if exFav:
            return jsonify({"message": "이미 즐겨찾기에 추가된 매장입니다."}), 409
        
        new_favorite4c = Favorite4c(cid=decoded_user_id, sid = shopId)

        db.session.add(new_favorite4c)
        db.session.commit()
        return jsonify({"message": "즐겨찾기 추가 성공", "decoded_user_id": decoded_user_id, "user_type": user_type}), 201
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
@home_bp.route("/<int:userId>/shop-mode/<int:shopId>/delete-shop", methods=["DELETE"])
@token_required
def delete_favorite_shop(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sInfo = db.session.query(Shop).filter_by(sid=shopId).first()

    if not sInfo:
        return jsonify({"error": "일치하는 매장이 없습니다."}), 404
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        exFav = db.session.query(Favorite4p).filter_by(pid=decoded_user_id, sid=shopId).first()
        
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        exFav = db.session.query(Favorite4c).filter_by(cid=decoded_user_id, sid=shopId).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    if not userInfo:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    if not exFav:
        return jsonify({"message": "즐겨찾기에 존재하지 않는 매장입니다."}), 404
    
    db.session.delete(exFav)
    db.session.commit()
    return jsonify({"message": "즐겨찾기 삭제 성공", "decoded_user_id": decoded_user_id, "user_type": user_type,}), 200

@home_bp.route("/<int:userId>/my-page", methods=["GET"])
@token_required
def get_my_page(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userData = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        isShopExist = 3
        shop_info = {}
    elif user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    
        shopData = db.session.query(Shop).filter_by(cid=decoded_user_id).first()
        if not shopData:
            isShopExist = CoUserType.JUSTUSER.value
            shop_info = {}
        else:
            isShopExist = CoUserType.SHOPUSER.value
            shop_info = {
                "shopId": shopData.sid,
                "presidentName": shopData.presidentName,
                "businessmanName": shopData.businessmanName,
                "shopName": shopData.shopName,
                "shoptel": shopData.shoptel,
                "businessEmail": shopData.businessEmail,
                "address": shopData.address,
                "region": shopData.region,
                "open": shopData.open,
                "close": shopData.close,
                "holiday": shopData.holiday,
                "shopimg1": shopData.shopimg1,
                "shopimg2": shopData.shopimg2,
                "shopimg3": shopData.shopimg3,
                "etc": shopData.etc,
                "createAt": shopData.createAt.isoformat()
            }
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    userInfo = {
        "name": userData.name,
        "nickname": userData.nickname,
        "email": userData.email,
        "region": userData.region,
        "profile": userData.img,
        "bankname": userData.bankname,
        "bankaccount": userData.bankaccount
    }

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "user_info": userInfo, "isShopExist": isShopExist, "shop_info": shop_info}), 200

@home_bp.route("/<int:userId>/my-page/check-my-commer", methods=["GET"])
@token_required
def get_my_cert(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "권한이 없습니다."}), 403

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    shopData = db.session.query(Shop).filter_by(cid=decoded_user_id).first()

    if not shopData:
        isShopExist = CoUserType.JUSTUSER.value
    else:
        isShopExist = CoUserType.SHOPUSER.value
    
    comCerts = (
        db.session.query(Commercialcert)
            .filter_by(cid=decoded_user_id)
            .order_by(Commercialcert.idx.desc())
            .all()
        )
    
    userInfo = {
        "name": userData.name,
        "profile": userData.img
    }
    
    cert_list = [
        {
            "certId": cert.idx,
            "state": cert.state,
            "createAt": cert.createAt.isoformat()
        } for cert in comCerts
    ]

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "user_info": userInfo, "isShopExist": isShopExist, "cert_list": cert_list}), 200

@home_bp.route("/<int:userId>/my-page/check-my-commer/<int:certId>", methods=["GET"])
@token_required
def get_my_cert_detail(decoded_user_id, user_type, userId, certId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "권한이 없습니다."}), 403

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    cert = db.session.query(Commercialcert).filter_by(idx=certId).first()

    if not cert:
        return jsonify({"error": "일치하는 승인 요청이 없습니다."}), 404

    if cert.cid != userData.cid:
        return jsonify({"error": "권한이 없습니다."}), 403
    
    userInfo = {
        "name": userData.name,
        "profile": userData.img
    }

    certInfo = {
        "certId": cert.idx,
        "name": cert.name,
        "presidentName": cert.presidentName,
        "businessmanName": cert.businessmanName,
        "businessEmail": cert.businessEmail,
        "coNumber": cert.coNumber,
        "address": cert.address,
        "bankname": cert.bankname,
        "bankaccount": cert.bankaccount,
        "state": cert.state,
        "reason": cert.reason,
        "createAt": cert.createAt.isoformat(),
        "licence": cert.licence,
        "accountPhoto": cert.accountPhoto
    }

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "user_info": userInfo, "cert": certInfo}), 200

@home_bp.route("/<int:userId>/my-page/check-my-commer/<int:certId>/re-cert", methods=["POST"])
@token_required
def re_submit_cert(decoded_user_id, user_type, userId, certId):
    name = request.form.get("name")
    presidentName = request.form.get("presidentName")
    businessmanName = request.form.get("businessmanName")
    businessEmail = request.form.get("businessEmail")
    coNumber = request.form.get("coNumber")
    address = request.form.get("address")
    bankname = request.form.get("bankname")
    bankaccount = request.form.get("bankaccount")
    licence = request.files.get("licence")
    accountPhoto = request.files.get("accountPhoto")
    

    if not all([name, presidentName, businessmanName, businessEmail, address, licence, coNumber, bankname, bankaccount, accountPhoto]):
        return jsonify({"error": "모든 정보를 입력해주세요."}), 400

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "권한이 없습니다."}), 403

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    cert = db.session.query(Commercialcert).filter_by(idx=certId).first()

    if not cert:
        return jsonify({"error": "일치하는 승인 요청이 없습니다."}), 404
    
    currentCert = (
            db.session.query(Commercialcert)
                .filter_by(cid=decoded_user_id)
                .order_by(Commercialcert.createAt.desc())
                .first()
        )
    
    if (cert.cid != userData.cid) or (cert.idx != currentCert.idx) or (userData.state != 3):
        return jsonify({"error": "잘못된 요청입니다."}), 403
    
    pdf_filename = secure_filename(f"{uuid4().hex}_{licence.filename}")
    pdf_save_path = os.path.join(LICENCE_UPLOAD_FOLDER, pdf_filename)

    try:
        licence.save(pdf_save_path)
    except Exception as e:
        return jsonify({"error": f"PDF 저장 실패: {str(e)}"}), 500

    pdf_url = f"/{LICENCE_UPLOAD_FOLDER}/{pdf_filename}"

    account_filename = secure_filename(f"{uuid4().hex}_{accountPhoto.filename}")
    account_save_path = os.path.join(BANK_UPLOAD_FOLDER, account_filename)

    try:
        accountPhoto.save(account_save_path)
    except Exception as e:
        return jsonify({"error": f"통장 사본 저장 실패: {str(e)}"}), 500

    account_url = f"/{BANK_UPLOAD_FOLDER}/{account_filename}"

    region = address.split()[0] + "-" + address.split()[1]

    userData.name = name
    userData.presidentName = presidentName
    userData.businessmanName = businessmanName
    userData.businessEmail = businessEmail
    userData.coNumber = coNumber
    userData.address = address
    userData.region = region
    userData.bankname = bankname
    userData.bankaccount = bankaccount
    userData.licence = pdf_url
    userData.accountPhoto = account_url

    new_certReq = Commercialcert(
        name = name,
        presidentName = presidentName,
        businessmanName = businessmanName,
        birth = userData.birth,
        tel = userData.tel,
        email = userData.email,
        businessEmail = businessEmail,
        address = address,
        coNumber = coNumber,
        bankname = bankname,
        bankaccount = bankaccount,
        licence=pdf_url,
        accountPhoto = account_url,
        cid=userData.cid
    )

    db.session.add(new_certReq)
    db.session.commit()

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "message": "재신청 완료" }), 201

@home_bp.route("/<int:userId>/my-page/check-my-commer/<int:certId>/regist-shop", methods=["POST"])
@token_required
def make_my_shop(decoded_user_id, user_type, userId, certId):
    presidentName = request.form.get("presidentName")
    businessmanName = request.form.get("businessmanName")
    businessEmail = request.form.get("businessEmail")
    address = request.form.get("address")

    shopName = request.form.get("shopName")
    shoptel = request.form.get("shoptel")
    shopOpen = request.form.get("shopOpen")
    shopClose = request.form.get("shopClose")
    holiday = request.form.get("holiday")
    etc = request.form.get("etc")

    imgfile1 = request.files.get("imgfile1")
    imgfile2 = request.files.get("imgfile2")
    imgfile3 = request.files.get("imgfile3")

    if not all([presidentName, businessmanName, businessEmail, address, shopName, shoptel, shopOpen, shopClose, holiday, etc, imgfile1, imgfile2, imgfile3]):
        return jsonify({"error": "모든 정보를 입력해주세요."}), 400
    
    region = address.split()[0] + "-" + address.split()[1]

    filename1 = secure_filename(f"{uuid4().hex}_{imgfile1.filename}")
    save_path1 = os.path.join(S_IMAGE_UPLOAD_FOLDER, filename1)

    filename2 = secure_filename(f"{uuid4().hex}_{imgfile2.filename}")
    save_path2 = os.path.join(S_IMAGE_UPLOAD_FOLDER, filename2)

    filename3 = secure_filename(f"{uuid4().hex}_{imgfile3.filename}")
    save_path3 = os.path.join(S_IMAGE_UPLOAD_FOLDER, filename3)
        
    try:
        imgfile1.save(save_path1)
        imgfile2.save(save_path2)
        imgfile3.save(save_path3)
    except Exception as e:
        return jsonify({"error": f"파일 저장 실패: {str(e)}"}), 500

    shopimg_url1 = f"/{S_IMAGE_UPLOAD_FOLDER}/{filename1}"
    shopimg_url2 = f"/{S_IMAGE_UPLOAD_FOLDER}/{filename2}"
    shopimg_url3 = f"/{S_IMAGE_UPLOAD_FOLDER}/{filename3}" 

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "권한이 없습니다."}), 403

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    cert = db.session.query(Commercialcert).filter_by(idx=certId).first()
    
    if not cert:
        return jsonify({"error": "일치하는 승인 요청이 없습니다."}), 404
    
    currentCert = (
            db.session.query(Commercialcert)
                .filter_by(cid=decoded_user_id)
                .order_by(Commercialcert.createAt.desc())
                .first()
        )
    
    exShop = db.session.query(Shop).filter_by(cid=userData.cid).first()

    if (cert.cid != userData.cid) or (cert.idx != currentCert.idx) or (userData.state != 2) or (exShop):
        return jsonify({"error": "잘못된 요청입니다."}), 403

    new_shop = Shop(
        cid = userData.cid,
        presidentName = presidentName,
        businessmanName = businessmanName,
        shopName = shopName,
        shoptel = shoptel,
        businessEmail = businessEmail,
        address = address,
        region=region,
        open=shopOpen,
        close=shopClose,
        holiday=holiday,
        etc=etc,
        shopimg1=shopimg_url1,
        shopimg2=shopimg_url2,
        shopimg3=shopimg_url3
    )
    
    try:
        db.session.add(new_shop)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"가게 생성 실패: {str(e)}"}), 500

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "message": "가게 등록 성공" }), 201

@home_bp.route("/<int:userId>/my-page/modify-info/check-pw", methods=["POST"])
@token_required
def check_pw_4_mi(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    data = request.get_json()
    password = data.get("password")

    if not password:
        return jsonify({"error": "비밀번호가 입력되지 않았습니다."}), 400

    if user_type == UserType.PERSONAL.value:
        user = db.session.query(Personal).filter_by(pid=userId).first()
    elif user_type == UserType.COMMERCIAL.value:
        user = db.session.query(Commercial).filter_by(cid=userId).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404

    if not user:
        return jsonify({"message": "존재하지 않는 회원."}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"error": "비밀번호가 일치하지 않습니다."}), 400
    
    randomCode = random.randint(100000, 999999)

    if user_type == UserType.PERSONAL.value:
        new_vaild4md = Vaild4pmd(email=user.email, randomCode = randomCode)
        user_info = {
            "name": user.name,
            "birth": user.birth,
            "tel": user.tel,
            "email": user.email,
            "nickname": user.nickname,
            "address": user.address
        }
    elif user_type == UserType.COMMERCIAL.value:
        new_vaild4md = Vaild4cmd(email=user.email, randomCode = randomCode)
        exShop = db.session.query(Shop).filter_by(cid=userId).first()
        if exShop:
            user_info = {
                "name": user.name,
                "birth": user.birth,
                "tel": user.tel,
                "email": user.email,
                "nickname": user.nickname,
                "address": user.address,
                "presidentName": user.presidentName,
                "businessmanName": user.businessmanName,
                "businessEmail": user.businessEmail,
                "coNumber": user.coNumber
            }
        else:
            user_info = {
                "name": user.name,
                "birth": user.birth,
                "tel": user.tel,
                "email": user.email,
                "nickname": user.nickname,
                "address": user.address
            }
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404

    db.session.add(new_vaild4md)
    db.session.commit()

    return jsonify({"message": "비밀번호 인증 성공", "decoded_user_id": decoded_user_id, "user_type": user_type, "randomCode": randomCode, "userInfo": user_info}), 201

@home_bp.route("/<int:userId>/my-page/modify-info", methods=["POST"])
@token_required
def modify_info(decoded_user_id, user_type, userId):
    randomCode = request.form.get("randomCode")
    tel = request.form.get("tel")
    nickname = request.form.get("nickname")
    address = request.form.get("address")
    bankname = request.form.get("bankname")
    bankaccount = request.form.get("bankaccount")

    if not all([randomCode, tel, nickname, address, bankname, bankaccount]):
        return jsonify({"error": "모든 정보를 입력해주세요."}), 400

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    try:
        randomCode = int(randomCode)
    except (TypeError, ValueError):
        return jsonify({"error": "유효하지 않은 유형 값입니다."}), 400
    
    if user_type == UserType.PERSONAL.value:
        user = db.session.query(Personal).filter_by(pid=userId).first()
        vali = db.session.query(Vaild4pmd).filter_by(email=user.email).order_by(desc(Vaild4pmd.idx)).first()
    elif user_type == UserType.COMMERCIAL.value:
        if address != "commercial":
            return jsonify({"error": "잘못된 접근"}), 403
        user = db.session.query(Commercial).filter_by(cid=userId).first()
        vali = db.session.query(Vaild4cmd).filter_by(email=user.email).order_by(desc(Vaild4cmd.idx)).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404

    if not user:
        return jsonify({"error": "존재하지 않는 회원."}), 404
    
    if (not vali) or (vali.randomCode != randomCode):
        return jsonify({"message": "회원정보 변경 절차가 올바르지 않음"}), 403
    
    try:
        if address != 'commercial':
            parts = address.split()
            region = parts[0] + "-" + parts[1]
    except IndexError:
        return jsonify({"error": "잘못된 주소 양식입니다."}), 400

    user.tel = tel
    user.nickname = nickname

    if user_type == UserType.PERSONAL.value:
        db.session.query(Pbooktrade).filter_by(pid=userId).update({"region": parts[0] + "-" + parts[1]})
        user.address = address
        user.region = region
        user.bankname = bankname
        user.bankaccount = bankaccount
    
    db.session.commit()

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "message": "정보변경 완료" }), 201

@home_bp.route("/<int:userId>/my-page/modify-pw", methods=["PUT"])
@token_required
def modify_password(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    data = request.get_json()
    curPassword = data.get("curPassword")
    newPassword = data.get("newPassword")

    if not all([curPassword, newPassword]):
        return jsonify({"error": "비밀번호가 입력되지 않았습니다."}), 400

    if user_type == UserType.PERSONAL.value:
        user = db.session.query(Personal).filter_by(pid=userId).first()
    elif user_type == UserType.COMMERCIAL.value:
        user = db.session.query(Commercial).filter_by(cid=userId).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404

    if not user:
        return jsonify({"message": "존재하지 않는 회원."}), 404

    if not check_password_hash(user.password, curPassword):
        return jsonify({"error": "비밀번호가 일치하지 않습니다."}), 400
    
    hashed_pw = generate_password_hash(newPassword)

    user.password = hashed_pw
    db.session.commit()

    return jsonify({"message": "비밀번호 변경 성공", "decoded_user_id": decoded_user_id, "user_type": user_type }), 200

@home_bp.route("/<int:userId>/my-page/modify-shop-address", methods=["POST"])
@token_required
def modi_shop_addr(decoded_user_id, user_type, userId):
    name = request.form.get("name")
    presidentName = request.form.get("presidentName")
    businessmanName = request.form.get("businessmanName")
    businessEmail = request.form.get("businessEmail")
    coNumber = request.form.get("coNumber")
    address = request.form.get("address")
    licence = request.files.get("licence")

    if not licence.filename.lower().endswith(".pdf"):
        return jsonify({"error": "PDF 파일만 업로드 가능합니다."}), 400

    if not all([name, presidentName, businessmanName, businessEmail, address, licence, coNumber]):
        return jsonify({"error": "모든 정보를 입력해주세요."}), 400

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "권한이 없습니다."}), 403

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    exShop = db.session.query(Shop).filter_by(cid=userData.cid).first()

    if not exShop:
        return jsonify({"error": "업장 변경 요청 권한 없음"}), 403
    
    cur_request = db.session.query(Modiaddress).filter_by(cid=userData.cid).order_by(desc(Modiaddress.idx)).first()
    if cur_request and cur_request.state == 1:
        return jsonify({"error": "이미 제출된 업장 변경 신청이 있습니다."}), 400
    
    pdf_filename = secure_filename(f"{uuid4().hex}_{licence.filename}")
    pdf_save_path = os.path.join(LICENCE_UPLOAD_FOLDER, pdf_filename)

    try:
        licence.save(pdf_save_path)
    except Exception as e:
        return jsonify({"error": f"PDF 저장 실패: {str(e)}"}), 500

    pdf_url = f"/{LICENCE_UPLOAD_FOLDER}/{pdf_filename}"

    new_modi_addr_req = Modiaddress(
        name = name,
        presidentName = presidentName,
        businessmanName = businessmanName,
        businessEmail = businessEmail,
        coNumber = coNumber,
        address = address,
        licence=pdf_url,
        cid=userData.cid
    )

    db.session.add(new_modi_addr_req)
    db.session.commit()

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "message": "업장 변경 신청 완료" }), 201

@home_bp.route("/<int:userId>/my-page/modify-img", methods=["POST"])
@token_required
def modify_profile(decoded_user_id, user_type, userId):
    imgfile = request.files.get("imgfile")
    if not imgfile:
        return jsonify({"error": "이미지 파일이 없습니다."}), 400

    filename = secure_filename(f"{uuid4().hex}_{imgfile.filename}")

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    if user_type == UserType.PERSONAL.value:
        save_path = os.path.join(P_PROFILE_UPLOAD_FOLDER, filename)
        img_url = f"/{P_PROFILE_UPLOAD_FOLDER}/{filename}"
        userData = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        save_path = os.path.join(C_PROFILE_UPLOAD_FOLDER, filename)
        img_url = f"/{C_PROFILE_UPLOAD_FOLDER}/{filename}"
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    try:
        imgfile.save(save_path)
    except Exception as e:
        return jsonify({"error": f"파일 저장 실패: {str(e)}"}), 500

    if not userData:
        return jsonify({"error": "일치하는 회원이 없습니다."}), 404
    
    try:
        userData.img = img_url
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"경로 저장 실패: {str(e)}"}), 500

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "img": img_url, "message": "프로필 변경 성공" }), 200

@home_bp.route("/<int:userId>/my-page/show-basket", methods=["GET"])
@token_required
def get_basket_main(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    combined_list = []
    sbook_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        pbp_results = (
            db.session.query(Pbasket2p, Pbooktrade, Personal)
            .join(Pbooktrade, Pbasket2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .order_by(Pbasket2p.idx.desc())
            .all()
        )

        pbc_results = (
            db.session.query(Pbasket2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Pbasket2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .order_by(Pbasket2c.idx.desc())
            .all()
        )

        pbs_results = (
            db.session.query(Pbasket2s, Sbooktrade, Shop)
            .join(Sbooktrade, Pbasket2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .order_by(Pbasket2s.idx.desc())
            .all()
        )

        for basket, book, seller in pbp_results:
            combined_list.append({
                "idx": basket.idx,
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.pid,
                "sellerName": seller.name,
                "nickname": seller.nickname,
                "createAt": book.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for basket, book, seller in pbc_results:
            combined_list.append({
                "idx": basket.idx,
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.cid,
                "sellerName": seller.name,
                "nickname": seller.nickname,
                "createAt": book.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "idx": basket.idx,
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "sid": shop.sid,
            "shopName": shop.shopName,
            "createAt": book.createAt.isoformat()
        } for basket, book, shop in pbs_results ]
            
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        cbp_results = (
            db.session.query(Cbasket2p, Pbooktrade, Personal)
            .join(Pbooktrade, Cbasket2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .order_by(Cbasket2p.idx.desc())
            .all()
        )

        cbc_results = (
            db.session.query(Cbasket2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Cbasket2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .order_by(Cbasket2c.idx.desc())
            .all()
        )

        cbs_results = (
            db.session.query(Cbasket2s, Sbooktrade, Shop)
            .join(Sbooktrade, Cbasket2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .order_by(Cbasket2s.idx.desc())
            .all()
        )

        for basket, book, seller in cbp_results:
            combined_list.append({
                "idx": basket.idx,
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.pid,
                "sellerName": seller.name,
                "nickname": seller.nickname,
                "createAt": book.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for basket, book, seller in cbc_results:
            combined_list.append({
                "idx": basket.idx,
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.cid,
                "sellerName": seller.name,
                "nickname": seller.nickname,
                "createAt": book.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "idx": basket.idx,
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "sid": shop.sid,
            "shopName": shop.shopName,
            "createAt": book.createAt.isoformat()
        } for basket, book, shop in cbs_results ]
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "book_list": book_list,
        "sbook_list": sbook_list
    }), 200

@home_bp.route("/<int:userId>/my-page/show-receipt", methods=["GET"])
@token_required
def show_user_receipt(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    pbook_groups = {}
    sbook_groups = {}
    rp_list = []
    rs_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        rp_results = (
            db.session.query(Preceipt2p)
            .filter(Preceipt2p.pid == userId)
            .order_by(Preceipt2p.rid.desc())
            .all()
        )

        rs_results = (
            db.session.query(Preceipt2s)
            .filter(Preceipt2s.pid == userId)
            .order_by(Preceipt2s.rid.desc())
            .all()
        )

        prp_orderids = [r.orderid for r in rp_results]
        prs_orderids = [r.orderid for r in rs_results]

        prp_pbs = (
            db.session.query(Pbooktrade, Personal)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(
                Pbooktrade.orderid.in_(prp_orderids),
                Pbooktrade.consumerid == decoded_user_id,
                Pbooktrade.consumer_type == UserType.PERSONAL.value
            )
            .all()
        )
        prp_cbs = (
            db.session.query(Cbooktrade, Commercial)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(
                Cbooktrade.orderid.in_(prp_orderids),
                Cbooktrade.consumerid == decoded_user_id,
                Cbooktrade.consumer_type == UserType.PERSONAL.value
            )
            .all()
        )
        prs_sbs = (
            db.session.query(Sbooktrade, Shop)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(
                Sbooktrade.orderid.in_(prs_orderids),
                Sbooktrade.consumerid == decoded_user_id,
                Sbooktrade.consumer_type == UserType.PERSONAL.value
            )
            .all()
        )

        rp_list = [ {
            "rid": receipt.rid,
            "orderid": receipt.orderid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "state": receipt.state,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat() if receipt.paidAt else None
        } for receipt in rp_results ]

        for book, seller in prp_pbs:
            oid = book.orderid
            if oid not in pbook_groups:
                pbook_groups[oid] = []
            pbook_groups[oid].append({
                "bid": book.bid,
                "orderid": book.orderid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.pid,
                "sellerName": seller.name,
                "sellerType": UserType.PERSONAL.value
            })

        for book, seller in prp_cbs:
            oid = book.orderid
            if oid not in pbook_groups:
                pbook_groups[oid] = []
            pbook_groups[oid].append({
                "bid": book.bid,
                "orderid": book.orderid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.cid,
                "sellerName": seller.name,
                "sellerType": UserType.COMMERCIAL.value
            })
        
        rs_list = [ {
            "rid": receipt.rid,
            "orderid": receipt.orderid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "state": receipt.state,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat() if receipt.paidAt else None
        } for receipt in rs_results ]

        for book, shop in prs_sbs:
            oid = book.orderid
            if oid not in sbook_groups:
                sbook_groups[oid] = []
            sbook_groups[oid].append({
                "bid": book.bid,
                "orderid": book.orderid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sid": shop.sid,
                "shopName": shop.shopName
            })

    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        rp_results = (
            db.session.query(Creceipt2p)
            .filter(Creceipt2p.cid == userId)
            .order_by(Creceipt2p.rid.desc())
            .all()
        )

        rs_results = (
            db.session.query(Creceipt2s)
            .filter(Creceipt2s.sid == userId)
            .order_by(Creceipt2s.rid.desc())
            .all()
        )

        crp_orderids = [r.orderid for r in rp_results]
        crs_orderids = [r.orderid for r in rs_results]

        crp_pbs = (
            db.session.query(Pbooktrade, Personal)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(
                Pbooktrade.orderid.in_(crp_orderids),
                Pbooktrade.consumerid == decoded_user_id,
                Pbooktrade.consumer_type == UserType.COMMERCIAL.value
            )
            .all()
        )
        crp_cbs = (
            db.session.query(Cbooktrade, Commercial)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(
                Cbooktrade.orderid.in_(crp_orderids),
                Cbooktrade.consumerid == decoded_user_id,
                Cbooktrade.consumer_type == UserType.COMMERCIAL.value
            )
            .all()
        )
        crs_sbs = (
            db.session.query(Sbooktrade, Shop)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(
                Sbooktrade.orderid.in_(crs_orderids),
                Sbooktrade.consumerid == decoded_user_id,
                Sbooktrade.consumer_type == UserType.PERSONAL.value
            )
            .all()
        )

        rp_list = [ {
            "rid": receipt.rid,
            "orderid": receipt.orderid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "state": receipt.state,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat() if receipt.paidAt else None
        } for receipt in rp_results ]

        for book, seller in crp_pbs:
            oid = book.orderid
            if oid not in pbook_groups:
                pbook_groups[oid] = []
            pbook_groups[oid].append({
                "bid": book.bid,
                "orderid": book.orderid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.pid,
                "sellerName": seller.name,
                "sellerType": UserType.PERSONAL.value
            })

        for book, seller in crp_cbs:
            oid = book.orderid
            if oid not in pbook_groups:
                pbook_groups[oid] = []
            pbook_groups[oid].append({
                "bid": book.bid,
                "orderid": book.orderid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sellerId": seller.cid,
                "sellerName": seller.name,
                "sellerType": UserType.COMMERCIAL.value
            })
        
        rs_list = [ {
            "rid": receipt.rid,
            "orderid": receipt.orderid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "state": receipt.state,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat() if receipt.paidAt else None
        } for receipt in rs_results ]

        for book, shop in crs_sbs:
            oid = book.orderid
            if oid not in sbook_groups:
                sbook_groups[oid] = []
            sbook_groups[oid].append({
                "bid": book.bid,
                "orderid": book.orderid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "sid": shop.sid,
                "shopName": shop.shopName
            })
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "receipt_personal": rp_list,
        "receipt_shop": rs_list,
        "books_personal": pbook_groups,
        "books_shop": sbook_groups
    }), 200

@home_bp.route("/<int:userId>/my-page/show-receipt/detail/<orderid>", methods=["GET"])
@token_required
def show_user_receipt_detail(decoded_user_id, user_type, userId, orderid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    book_list = []
    rp_info = {}
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        rpInfo = db.session.query(Preceipt2p).filter_by(pid=decoded_user_id, orderid = orderid).first()
        rsInfo = db.session.query(Preceipt2s).filter_by(pid=decoded_user_id, orderid = orderid).first()
        
        if rpInfo:
            prp_pbs = (
                db.session.query(Pbooktrade, Personal)
                .join(Personal, Pbooktrade.pid == Personal.pid)
                .filter(
                    Pbooktrade.orderid == orderid,
                    Pbooktrade.consumerid == decoded_user_id,
                    Pbooktrade.consumer_type == UserType.PERSONAL.value
                )
                .all()
            )
            prp_cbs = (
                db.session.query(Cbooktrade, Commercial)
                .join(Commercial, Cbooktrade.cid == Commercial.cid)
                .filter(
                    Cbooktrade.orderid == orderid,
                    Cbooktrade.consumerid == decoded_user_id,
                    Cbooktrade.consumer_type == UserType.PERSONAL.value
                )
                .all()
            )

            rp_info = {
                "rid": rpInfo.rid,
                "orderid": rpInfo.orderid,
                "amount": rpInfo.amount,
                "installment_month": rpInfo.installment_months,
                "state": rpInfo.state,
                "reason": rpInfo.reason,
                "payment_method": rpInfo.payment_method,
                "paidAt": rpInfo.paidAt.isoformat() if rpInfo.paidAt else None
            }

            for book, seller in prp_pbs:
                book_list.append({
                    "bid": book.bid,
                    "orderid": book.orderid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "region": book.region,
                    "bookimg": book.img1,
                    "sellerId": seller.pid,
                    "sellerName": seller.name,
                    "sellerType": UserType.PERSONAL.value
                })

            for book, seller in prp_cbs:
                book_list.append({
                    "bid": book.bid,
                    "orderid": book.orderid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "region": book.region,
                    "bookimg": book.img1,
                    "sellerId": seller.cid,
                    "sellerName": seller.name,
                    "sellerType": UserType.COMMERCIAL.value
                })
        elif rsInfo:
            prs_sbs = (
                db.session.query(Sbooktrade, Shop)
                .join(Shop, Sbooktrade.sid == Shop.sid)
                .filter(
                    Sbooktrade.orderid == orderid,
                    Sbooktrade.consumerid == decoded_user_id,
                    Sbooktrade.consumer_type == UserType.PERSONAL.value
                )
                .all()
            )

            rp_info = {
                "rid": rsInfo.rid,
                "orderid": rsInfo.orderid,
                "amount": rsInfo.amount,
                "installment_month": rsInfo.installment_months,
                "state": rsInfo.state,
                "reason": rsInfo.reason,
                "payment_method": rsInfo.payment_method,
                "paidAt": rsInfo.paidAt.isoformat() if rsInfo.paidAt else None
            }

            for book, shop in prs_sbs:
                book_list.append({
                    "bid": book.bid,
                    "orderid": book.orderid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "region": book.region,
                    "bookimg": book.img1,
                    "sid": shop.sid,
                    "shopName": shop.shopName
                })
        else:
            return jsonify({"error": "존재하지 않는 구매내역"}), 404
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        rpInfo = db.session.query(Creceipt2p).filter_by(cid=decoded_user_id, orderid = orderid).first()
        rsInfo = db.session.query(Creceipt2s).filter_by(cid=decoded_user_id, orderid = orderid).first()

        if rpInfo:
            crp_pbs = (
                db.session.query(Pbooktrade, Personal)
                .join(Personal, Pbooktrade.pid == Personal.pid)
                .filter(
                    Pbooktrade.orderid == orderid,
                    Pbooktrade.consumerid == decoded_user_id,
                    Pbooktrade.consumer_type == UserType.PERSONAL.value
                )
                .all()
            )
            crp_cbs = (
                db.session.query(Cbooktrade, Commercial)
                .join(Commercial, Cbooktrade.cid == Commercial.cid)
                .filter(
                    Cbooktrade.orderid == orderid,
                    Cbooktrade.consumerid == decoded_user_id,
                    Cbooktrade.consumer_type == UserType.PERSONAL.value
                )
                .all()
            )

            rp_info = {
                "rid": rpInfo.rid,
                "orderid": rpInfo.orderid,
                "amount": rpInfo.amount,
                "installment_month": rpInfo.installment_months,
                "state": rpInfo.state,
                "reason": rpInfo.reason,
                "payment_method": rpInfo.payment_method,
                "paidAt": rpInfo.paidAt.isoformat() if rpInfo.paidAt else None
            }

            for book, seller in crp_pbs:
                book_list.append({
                    "bid": book.bid,
                    "orderid": book.orderid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "region": book.region,
                    "bookimg": book.img1,
                    "sellerId": seller.pid,
                    "sellerName": seller.name,
                    "sellerType": UserType.PERSONAL.value
                })

            for book, seller in crp_cbs:
                book_list.append({
                    "bid": book.bid,
                    "orderid": book.orderid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "region": book.region,
                    "bookimg": book.img1,
                    "sellerId": seller.cid,
                    "sellerName": seller.name,
                    "sellerType": UserType.COMMERCIAL.value
                })
        elif rsInfo:
            crs_sbs = (
                db.session.query(Sbooktrade, Shop)
                .join(Shop, Sbooktrade.sid == Shop.sid)
                .filter(
                    Sbooktrade.orderid == orderid,
                    Sbooktrade.consumerid == decoded_user_id,
                    Sbooktrade.consumer_type == UserType.PERSONAL.value
                )
                .all()
            )

            rp_info = {
                "rid": rsInfo.rid,
                "orderid": rsInfo.orderid,
                "amount": rsInfo.amount,
                "installment_month": rsInfo.installment_months,
                "state": rsInfo.state,
                "reason": rsInfo.reason,
                "payment_method": rsInfo.payment_method,
                "paidAt": rsInfo.paidAt.isoformat() if rsInfo.paidAt else None
            }

            for book, shop in crs_sbs:
                book_list.append({
                    "bid": book.bid,
                    "orderid": book.orderid,
                    "title": book.title,
                    "author": book.author,
                    "publish": book.publish,
                    "isbn": book.isbn,
                    "price": book.price,
                    "region": book.region,
                    "bookimg": book.img1,
                    "sid": shop.sid,
                    "shopName": shop.shopName
                })
        else:
            return jsonify({"error": "존재하지 않는 구매내역"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "receipt_info": rp_info,
        "book_list": book_list
    }), 200

@home_bp.route("/<int:userId>/my-page/check-my-product", methods=["GET"])
@token_required
def show_my_product(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sold_book_list = []
    on_sale_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        sold_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                and_(
                    Pbooktrade.pid==decoded_user_id,
                    or_(
                        Pbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value,
                        Pbooktrade.state == PurchaseState.USER_CANCELLED.value,
                        Pbooktrade.state == PurchaseState.REFUNDED.value
                    )
                )
            )
            .order_by(Pbooktrade.bid.desc())
            .limit(10)
            .all()
        )

        sale_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                Pbooktrade.pid==decoded_user_id,
                Pbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Pbooktrade.bid.desc())
            .limit(10)
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        sold_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                and_(
                    Cbooktrade.cid==decoded_user_id,
                    or_(
                        Cbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value,
                        Cbooktrade.state == PurchaseState.USER_CANCELLED.value,
                        Cbooktrade.state == PurchaseState.REFUNDED.value
                    )
                )
            )
            .order_by(Cbooktrade.bid.desc())
            .limit(10)
            .all()
        )

        sale_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                Cbooktrade.cid==decoded_user_id,
                Cbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Cbooktrade.bid.desc())
            .limit(10)
            .all()
        )
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    if (not sold_book_results) and (not sale_book_results) :
        return jsonify({
            "decoded_user_id": decoded_user_id,
            "user_type": user_type,
            "user_info": user_info,
            "sold_book_list": [],
            "on_sale_book_list": []
        }), 200
    
    if sold_book_results:
        for book in sold_book_results:
            if book.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2p, Personal)
                    .join(Personal, Preceipt2p.pid == Personal.pid)
                    .filter(Preceipt2p.orderid == book.orderid)
                    .first()
                )
            elif book.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2p, Commercial)
                    .join(Commercial, Creceipt2p.cid == Commercial.cid)
                    .filter(Creceipt2p.orderid == book.orderid)
                    .first()
                )
            else:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404

            if not receiptInfo:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404
            
            receipt, owner = receiptInfo

            sold_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),

                "state": book.state,
                "orderid": book.orderid,
                "consumerid": book.consumerid,
                "consumer_type": book.consumer_type,

                "rid": receipt.rid,
                "amount": receipt.amount,
                "installment_month": receipt.installment_months,
                "reason": receipt.reason,
                "payment_method": receipt.payment_method,
                "paidAt": receipt.paidAt.isoformat(),

                "ownerName": owner.name,
                "ownertel": owner.tel,
                "ownerEmail": owner.email,
                "ownerNickname": owner.nickname,
                "ownerRegion": owner.region,
                "ownerAddress": owner.address,
                "ownerType": book.consumer_type
            })
    else:
        sold_book_list = []


    if sale_book_results:
        for book in sale_book_results:
            on_sale_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),
                "state": book.state,
            })
    else:
        on_sale_book_list = []
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "sold_book_list": sold_book_list,
        "on_sale_book_list": on_sale_book_list
    }), 200

@home_bp.route("/<int:userId>/my-page/check-my-product/more-sold-book", methods=["GET"])
@token_required
def show_my_sold_product(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sold_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        sold_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                and_(
                    Pbooktrade.pid==decoded_user_id,
                    or_(
                        Pbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value,
                        Pbooktrade.state == PurchaseState.USER_CANCELLED.value,
                        Pbooktrade.state == PurchaseState.REFUNDED.value
                    )
                )
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        sold_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                and_(
                    Cbooktrade.cid==decoded_user_id,
                    or_(
                        Cbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value,
                        Cbooktrade.state == PurchaseState.USER_CANCELLED.value,
                        Cbooktrade.state == PurchaseState.REFUNDED.value
                    )
                )
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    if not sold_book_results :
        pass
    else:
        for book in sold_book_results:
            if book.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2p, Personal)
                    .join(Personal, Preceipt2p.pid == Personal.pid)
                    .filter(Preceipt2p.orderid == book.orderid)
                    .first()
                )
            elif book.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2p, Commercial)
                    .join(Commercial, Creceipt2p.cid == Commercial.cid)
                    .filter(Creceipt2p.orderid == book.orderid)
                    .first()
                )
            else:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404

            if not receiptInfo:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404
            
            receipt, owner = receiptInfo

            sold_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),

                "state": book.state,
                "orderid": book.orderid,
                "consumerid": book.consumerid,
                "consumer_type": book.consumer_type,

                "rid": receipt.rid,
                "amount": receipt.amount,
                "installment_month": receipt.installment_months,
                "reason": receipt.reason,
                "payment_method": receipt.payment_method,
                "paidAt": receipt.paidAt.isoformat(),

                "ownerName": owner.name,
                "ownertel": owner.tel,
                "ownerEmail": owner.email,
                "ownerNickname": owner.nickname,
                "ownerRegion": owner.region,
                "ownerAddress": owner.address,
                "ownerType": book.consumer_type
            })
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "sold_book_list": sold_book_list,
    }), 200

@home_bp.route("/<int:userId>/my-page/check-my-product/more-sale-book", methods=["GET"])
@token_required
def show_my_sale_product(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    on_sale_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        sale_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                Pbooktrade.pid==decoded_user_id,
                Pbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        sale_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                Cbooktrade.cid==decoded_user_id,
                Cbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    if not sale_book_results:
        pass
    else:
        for book in sale_book_results:
            on_sale_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),
                "state": book.state,
            })
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "on_sale_book_list": on_sale_book_list
    }), 200

@home_bp.route("/<int:userId>/my-page/check-my-product/search", methods=["GET"])
@token_required
def search_my_stock(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400

    keyword_pattern = f"%{keyword}%"

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sold_book_list = []
    on_sale_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        sold_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                and_(
                    Pbooktrade.pid==decoded_user_id,
                    or_(
                        Pbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value,
                        Pbooktrade.state == PurchaseState.USER_CANCELLED.value,
                        Pbooktrade.state == PurchaseState.REFUNDED.value
                    ),
                    or_(
                        Pbooktrade.title.ilike(keyword_pattern),
                        Pbooktrade.author.ilike(keyword_pattern),
                        Pbooktrade.publish.ilike(keyword_pattern),
                        Pbooktrade.isbn.ilike(keyword_pattern)
                    ),
                )
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )

        sale_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                Pbooktrade.pid==decoded_user_id,
                Pbooktrade.state == PurchaseState.ONSALE.value,
                or_(
                        Pbooktrade.title.ilike(keyword_pattern),
                        Pbooktrade.author.ilike(keyword_pattern),
                        Pbooktrade.publish.ilike(keyword_pattern),
                        Pbooktrade.isbn.ilike(keyword_pattern)
                    ),
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        sold_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                and_(
                    Cbooktrade.cid==decoded_user_id,
                    or_(
                        Cbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value,
                        Cbooktrade.state == PurchaseState.USER_CANCELLED.value,
                        Cbooktrade.state == PurchaseState.REFUNDED.value
                    ),
                    or_(
                        Cbooktrade.title.ilike(keyword_pattern),
                        Cbooktrade.author.ilike(keyword_pattern),
                        Cbooktrade.publish.ilike(keyword_pattern),
                        Cbooktrade.isbn.ilike(keyword_pattern)
                    ),
                )
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )

        sale_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                Cbooktrade.cid==decoded_user_id,
                Cbooktrade.state == PurchaseState.ONSALE.value,
                or_(
                        Cbooktrade.title.ilike(keyword_pattern),
                        Cbooktrade.author.ilike(keyword_pattern),
                        Cbooktrade.publish.ilike(keyword_pattern),
                        Cbooktrade.isbn.ilike(keyword_pattern)
                    ),
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    if (not sold_book_results) and (not sale_book_results) :
        return jsonify({
            "decoded_user_id": decoded_user_id,
            "user_type": user_type,
            "user_info": user_info,
            "sold_book_list": [],
            "on_sale_book_list": []
        }), 200
    
    if sold_book_results:
        for book in sold_book_results:
            if book.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2p, Personal)
                    .join(Personal, Preceipt2p.pid == Personal.pid)
                    .filter(Preceipt2p.orderid == book.orderid)
                    .first()
                )
            elif book.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2p, Commercial)
                    .join(Commercial, Creceipt2p.cid == Commercial.cid)
                    .filter(Creceipt2p.orderid == book.orderid)
                    .first()
                )
            else:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404

            if not receiptInfo:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404
            
            receipt, owner = receiptInfo

            sold_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),

                "state": book.state,
                "orderid": book.orderid,
                "consumerid": book.consumerid,
                "consumer_type": book.consumer_type,

                "rid": receipt.rid,
                "amount": receipt.amount,
                "installment_month": receipt.installment_months,
                "reason": receipt.reason,
                "payment_method": receipt.payment_method,
                "paidAt": receipt.paidAt.isoformat(),

                "ownerName": owner.name,
                "ownertel": owner.tel,
                "ownerEmail": owner.email,
                "ownerNickname": owner.nickname,
                "ownerRegion": owner.region,
                "ownerAddress": owner.address,
                "ownerType": book.consumer_type
            })
    else:
        sold_book_list = []


    if sale_book_results:
        for book in sale_book_results:
            on_sale_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),
                "state": book.state,
            })
    else:
        on_sale_book_list = []
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "sold_book_list": sold_book_list,
        "on_sale_book_list": on_sale_book_list
    }), 200

@home_bp.route("/<int:userId>/my-page/check-my-product/detail/<int:bookId>", methods=["GET"])
@token_required
def show_my_pd_detail(decoded_user_id, user_type, userId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        bookInfo = db.session.query(Pbooktrade).filter(Pbooktrade.pid == decoded_user_id, Pbooktrade.bid == bookId).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        bookInfo = db.session.query(Cbooktrade).filter(Cbooktrade.cid == decoded_user_id, Cbooktrade.bid == bookId).first()
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404
    
    if not bookInfo:
        return jsonify({"error": "해당 책이 존재하지 않습니다."}), 404
    
    if (bookInfo.state == PurchaseState.PAYMENT_SUCCESS.value) or (bookInfo.state == PurchaseState.USER_CANCELLED.value) or (bookInfo.state == PurchaseState.REFUNDED.value):
        if bookInfo.consumer_type == UserType.PERSONAL.value:
            receiptInfo = (
                db.session.query(Preceipt2p, Personal)
                .join(Personal, Preceipt2p.pid == Personal.pid)
                .filter(Preceipt2p.orderid == bookInfo.orderid)
                .first()
            )
        elif bookInfo.consumer_type == UserType.COMMERCIAL.value:
            receiptInfo = (
                db.session.query(Creceipt2p, Commercial)
                .join(Commercial, Creceipt2p.cid == Commercial.cid)
                .filter(Creceipt2p.orderid == bookInfo.orderid)
                .first()
            )
        else:
           return jsonify({"error": "접근 권한 없음"}), 403
        
        receipt, owner = receiptInfo
         
        book_info = {
            "bid": bookInfo.bid,
            "title": bookInfo.title,
            "author": bookInfo.author,
            "publish": bookInfo.publish,
            "isbn": bookInfo.isbn,
            "price": bookInfo.price,
            "region": bookInfo.region,
            "bookimg1": bookInfo.img1,
            "bookimg2": bookInfo.img2,
            "bookimg3": bookInfo.img3,
            "createAt": bookInfo.createAt.isoformat(),

            "state": bookInfo.state,
            "orderid": bookInfo.orderid,
            "consumerid": bookInfo.consumerid,
            "consumer_type": bookInfo.consumer_type,

            "rid": receipt.rid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat(),

            "ownerName": owner.name,
            "ownertel": owner.tel,
            "ownerEmail": owner.email,
            "ownerNickname": owner.nickname,
            "ownerRegion": owner.region,
            "ownerAddress": owner.address,
            "ownerType": bookInfo.consumer_type
        }
    elif bookInfo.state == PurchaseState.ONSALE.value:
        book_info = {
            "bid": bookInfo.bid,
            "title": bookInfo.title,
            "author": bookInfo.author,
            "publish": bookInfo.publish,
            "isbn": bookInfo.isbn,
            "price": bookInfo.price,
            "region": bookInfo.region,
            "bookimg1": bookInfo.img1,
            "bookimg2": bookInfo.img2,
            "bookimg3": bookInfo.img3,
            "createAt": bookInfo.createAt.isoformat(),
            "state": bookInfo.state,
        }
    else:
        book_info = {}
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "book_info": book_info,
    }), 200

@home_bp.route("/<int:userId>/my-page/check-my-product/add-product", methods=["POST"])
@token_required
def add_my_product(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    else:
        return jsonify({"error": "접근 권한 없음"}), 403

    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404

  
    title = request.form.get("title")
    author = request.form.get("author")
    publish = request.form.get("publish")
    isbn = request.form.get("isbn")
    price = request.form.get("price")
    try:
        price = int(price)
    except ValueError:
        return jsonify({"error": "가격 형식이 올바르지 않습니다."}), 400
    detail = request.form.get("detail")
    region = request.form.get("region")
    img1 = request.files.get("img1")
    img2 = request.files.get("img2")
    img3 = request.files.get("img3")

    if not all([img1, img2, img3]):
        return jsonify({"error": "모든 이미지 파일을 업로드해야 합니다."}), 400
    
    if not all([title, author, publish, isbn, price, region]):
        return jsonify({"error": "필수 필드 누락"}), 400
    
    on_sale_book_list = []

    if user_type == UserType.PERSONAL.value:
        filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
        save_path1 = os.path.join(PBOOK_UPLOAD_FOLDER, filename1)

        filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
        save_path2 = os.path.join(PBOOK_UPLOAD_FOLDER, filename2)

        filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
        save_path3 = os.path.join(PBOOK_UPLOAD_FOLDER, filename3)
        
        try:
            img1.save(save_path1)
            img2.save(save_path2)
            img3.save(save_path3)
        except Exception as e:
            return jsonify({"error": f"파일 저장 실패: {str(e)}"}), 500

        img_url1 = f"/{PBOOK_UPLOAD_FOLDER}/{filename1}"
        img_url2 = f"/{PBOOK_UPLOAD_FOLDER}/{filename2}"
        img_url3 = f"/{PBOOK_UPLOAD_FOLDER}/{filename3}"   

        new_book = Pbooktrade(
            pid = decoded_user_id,
            title = title,
            author = author,
            publish = publish,
            isbn = isbn,
            price = price,
            detail = detail,
            region = region,
            img1 = img_url1,
            img2 = img_url2,
            img3 = img_url3
        )
    elif user_type == UserType.COMMERCIAL.value:
        filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
        save_path1 = os.path.join(CBOOK_UPLOAD_FOLDER, filename1)

        filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
        save_path2 = os.path.join(CBOOK_UPLOAD_FOLDER, filename2)

        filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
        save_path3 = os.path.join(CBOOK_UPLOAD_FOLDER, filename3)
        
        try:
            img1.save(save_path1)
            img2.save(save_path2)
            img3.save(save_path3)
        except Exception as e:
            return jsonify({"error": f"파일 저장 실패: {str(e)}"}), 500

        img_url1 = f"/{CBOOK_UPLOAD_FOLDER}/{filename1}"
        img_url2 = f"/{CBOOK_UPLOAD_FOLDER}/{filename2}"
        img_url3 = f"/{CBOOK_UPLOAD_FOLDER}/{filename3}"   

        new_book = Cbooktrade(
            cid = decoded_user_id,
            title = title,
            author = author,
            publish = publish,
            isbn = isbn,
            price = price,
            detail = detail,
            region = region,
            img1 = img_url1,
            img2 = img_url2,
            img3 = img_url3
        )

    db.session.add(new_book)
    db.session.commit()

    # 책 추가 후 판매 중인 책 리스트 띄우기
    if user_type == UserType.PERSONAL.value:
        sale_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                Pbooktrade.pid==decoded_user_id,
                Pbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        sale_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                Cbooktrade.cid==decoded_user_id,
                Cbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )

    if sale_book_results:
        for book in sale_book_results:
            on_sale_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),
                "state": book.state,
            })
    else:
        pass
    
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "책 추가 완료", "on_sale_book_list": on_sale_book_list, "user_info": user_info}), 201

@home_bp.route("/<int:userId>/my-page/check-my-product/modify-product/<int:bookId>", methods=["POST"])
@token_required
def modify_my_stock(decoded_user_id, user_type, userId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        bookInfo = db.session.query(Pbooktrade).filter_by(bid=bookId, pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        bookInfo = db.session.query(Cbooktrade).filter_by(bid=bookId, cid=decoded_user_id).first()
    else:
        return jsonify({"error": "접근 권한 없음"}), 403

    if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404

    if not bookInfo:
        return jsonify({"error": "해당 책을 찾을 수 없습니다."}), 404
    
    if bookInfo.state != PurchaseState.ONSALE.value:
        return jsonify({"message": 2, "message2": "판매 중인 재고가 아닙니다."}), 404
    
    img_url1 = bookInfo.img1
    img_url2 = bookInfo.img2
    img_url3 = bookInfo.img3
    
    title = request.form.get("title")
    author = request.form.get("author")
    publish = request.form.get("publish")
    isbn = request.form.get("isbn")
    price = request.form.get("price")
    try:
        price = int(price)
    except ValueError:
        return jsonify({"error": "가격 형식이 올바르지 않습니다."}), 400
    detail = request.form.get("detail")
    region = request.form.get("region")
    img1 = request.files.get("img1")
    img2 = request.files.get("img2")
    img3 = request.files.get("img3")

    if not all([title, author, publish, isbn, price]):
        return jsonify({"error": "필수 필드 누락"}), 400
    
    on_sale_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        if img1:
            filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
            save_path1 = os.path.join(PBOOK_UPLOAD_FOLDER, filename1)
            try:
                img1.save(save_path1)
                img_url1 = f"/{PBOOK_UPLOAD_FOLDER}/{filename1}"
            except Exception as e:
                return jsonify({"error": f"img1 저장 실패: {str(e)}"}), 500

        if img2:
            filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
            save_path2 = os.path.join(PBOOK_UPLOAD_FOLDER, filename2)
            try:
                img2.save(save_path2)
                img_url2 = f"/{PBOOK_UPLOAD_FOLDER}/{filename2}"
            except Exception as e:
                return jsonify({"error": f"img2 저장 실패: {str(e)}"}), 500

        if img3:
            filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
            save_path3 = os.path.join(PBOOK_UPLOAD_FOLDER, filename3)
            try:
                img3.save(save_path3)
                img_url3 = f"/{PBOOK_UPLOAD_FOLDER}/{filename3}"
            except Exception as e:
                return jsonify({"error": f"img3 저장 실패: {str(e)}"}), 500
        
    elif user_type == UserType.COMMERCIAL.value:
        if img1:
            filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
            save_path1 = os.path.join(CBOOK_UPLOAD_FOLDER, filename1)
            try:
                img1.save(save_path1)
                img_url1 = f"/{CBOOK_UPLOAD_FOLDER}/{filename1}"
            except Exception as e:
                return jsonify({"error": f"img1 저장 실패: {str(e)}"}), 500

        if img2:
            filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
            save_path2 = os.path.join(CBOOK_UPLOAD_FOLDER, filename2)
            try:
                img2.save(save_path2)
                img_url2 = f"/{CBOOK_UPLOAD_FOLDER}/{filename2}"
            except Exception as e:
                return jsonify({"error": f"img2 저장 실패: {str(e)}"}), 500

        if img3:
            filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
            save_path3 = os.path.join(CBOOK_UPLOAD_FOLDER, filename3)
            try:
                img3.save(save_path3)
                img_url3 = f"/{CBOOK_UPLOAD_FOLDER}/{filename3}"
            except Exception as e:
                return jsonify({"error": f"img3 저장 실패: {str(e)}"}), 500
        
    bookInfo.title = title
    bookInfo.author = author
    bookInfo.publish = publish
    bookInfo.isbn = isbn
    bookInfo.price = price
    bookInfo.detail = detail
    bookInfo.region = region
    bookInfo.img1 = img_url1
    bookInfo.img2 = img_url2
    bookInfo.img3 = img_url3  

    db.session.commit()

    # 책 추가 후 판매 중인 책 리스트 띄우기
    if user_type == UserType.PERSONAL.value:
        sale_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                Pbooktrade.pid==decoded_user_id,
                Pbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        sale_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                Cbooktrade.cid==decoded_user_id,
                Cbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )

    if sale_book_results:
        for book in sale_book_results:
            on_sale_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),
                "state": book.state,
            })
    else:
        pass
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "책 수정 완료", "on_sale_book_list": on_sale_book_list, "user_info": user_info}), 200

@home_bp.route("/<int:userId>/my-page/check-my-product/delete-product/<int:bookId>", methods=["DELETE"])
@token_required
def delete_my_stock(decoded_user_id, user_type, userId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        bookInfo = db.session.query(Pbooktrade).filter_by(bid=bookId, pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        bookInfo = db.session.query(Cbooktrade).filter_by(bid=bookId, cid=decoded_user_id).first()
    else:
        return jsonify({"error": "접근 권한 없음"}), 403

    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404

    if not bookInfo:
        return jsonify({"error": "존재하지 않는 재고"}), 404
    
    if bookInfo.state != PurchaseState.ONSALE.value:
        return jsonify({"message": 2, "message2": "판매 중인 재고가 아닙니다."}), 404
    
    on_sale_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        db.session.query(Pbooktrade).filter_by(pid=decoded_user_id, bid=bookId).delete()
    elif user_type == UserType.COMMERCIAL.value:
        db.session.query(Cbooktrade).filter_by(cid=decoded_user_id, bid=bookId).delete()
    
    db.session.commit()
    
     # 책 추가 후 판매 중인 책 리스트 띄우기
    if user_type == UserType.PERSONAL.value:
        sale_book_results = (
            db.session.query(Pbooktrade)
            .filter(
                Pbooktrade.pid==decoded_user_id,
                Pbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        sale_book_results = (
            db.session.query(Cbooktrade)
            .filter(
                Cbooktrade.cid==decoded_user_id,
                Cbooktrade.state == PurchaseState.ONSALE.value
            )
            .order_by(Cbooktrade.bid.desc())
            .all()
        )

    if sale_book_results:
        for book in sale_book_results:
            on_sale_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),
                "state": book.state,
            })
    else:
        pass
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "책 삭제 완료", "on_sale_book_list": on_sale_book_list, "user_info": user_info}), 200

@home_bp.route("/<int:userId>/my-page/check-payment", methods=["GET"])
@token_required
def show_payment_book(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    payment_book_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        payment_book_results = (
            db.session.query(Pbooktrade)
            .filter(Pbooktrade.pid==decoded_user_id, Pbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        payment_book_results = (
            db.session.query(Cbooktrade)
            .filter(Cbooktrade.cid==decoded_user_id, Cbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
            .order_by(Cbooktrade.bid.desc())
            .all()
        )
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    if not payment_book_results :
        pass
    else:
        for book in payment_book_results:
            if book.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2p, Personal)
                    .join(Personal, Preceipt2p.pid == Personal.pid)
                    .filter(Preceipt2p.orderid == book.orderid)
                    .first()
                )
            elif book.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2p, Commercial)
                    .join(Commercial, Creceipt2p.cid == Commercial.cid)
                    .filter(Creceipt2p.orderid == book.orderid)
                    .first()
                )
            else:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404

            if not receiptInfo:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404
            
            receipt, owner = receiptInfo

            payment_book_list.append({
                "bid": book.bid,
                "title": book.title,
                "author": book.author,
                "publish": book.publish,
                "isbn": book.isbn,
                "price": book.price,
                "region": book.region,
                "bookimg": book.img1,
                "createAt": book.createAt.isoformat(),

                "state": book.state,
                "orderid": book.orderid,
                "consumerid": book.consumerid,
                "consumer_type": book.consumer_type,

                "rid": receipt.rid,
                "amount": receipt.amount,
                "installment_month": receipt.installment_months,
                "reason": receipt.reason,
                "payment_method": receipt.payment_method,
                "paidAt": receipt.paidAt.isoformat(),

                "ownerName": owner.name,
                "ownertel": owner.tel,
                "ownerEmail": owner.email,
                "ownerNickname": owner.nickname,
                "ownerRegion": owner.region,
                "ownerAddress": owner.address,
                "ownerType": book.consumer_type
            })
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "payment_book_list": payment_book_list,
    }), 200

@home_bp.route("/<int:userId>/my-page/check-payment/req-payment", methods=["POST"])
@token_required
def request_ppay(decoded_user_id, user_type, userId):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON 데이터가 없습니다."}), 400

    books = data.get("books")
    price = data.get("price")

    if not all([books, price is not None]):
        return jsonify({"error": "필수 항목 누락"}), 400

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if not books or not isinstance(books, list):
        return jsonify({"error": "책 목록이 유효하지 않습니다."}), 400
    
    server_cal_price = 0
    payment_book_list = []
    
    if (user_type == UserType.PERSONAL.value):
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        matched_books = (
            db.session.query(Pbooktrade)
            .filter(Pbooktrade.bid.in_(books))
            .filter(Pbooktrade.pid == decoded_user_id)
            .all()
        )
    elif (user_type == UserType.COMMERCIAL.value):
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        matched_books = (
            db.session.query(Cbooktrade)
            .filter(Cbooktrade.bid.in_(books))
            .filter(Cbooktrade.cid == decoded_user_id)
            .all()
        )
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    for eb in matched_books:
        if eb.state != PurchaseState.PAYMENT_SUCCESS.value:
            return jsonify({"error": "정산할 수 없는 도서 존재"}), 400
        server_cal_price += eb.price

    if int(price) != server_cal_price:
        return jsonify({"error": "총계 불일치"}), 400

    if (user_type == UserType.PERSONAL.value):
        newPm = Ppayment(
            pid=decoded_user_id,
            price=server_cal_price
        )
    elif (user_type == UserType.COMMERCIAL.value):
        newPm = Cpayment(
            cid=decoded_user_id,
            price=server_cal_price
        )
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    db.session.add(newPm)
    db.session.flush()
    
    for book in matched_books:
        book.state = PurchaseState.CALCULATE.value
        book.ppid = newPm.ppid

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "서버 오류", "details": str(e)}), 500
    
    # 정산 신청 완료 후 다시 정산 가능 리스트를 띄우기 위한 데이터 응답
    if user_type == UserType.PERSONAL.value:
        payment_book_results = (
            db.session.query(Pbooktrade)
            .filter(Pbooktrade.pid==decoded_user_id, Pbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
            .order_by(Pbooktrade.bid.desc())
            .all()
        )
    elif user_type == UserType.COMMERCIAL.value:
        payment_book_results = (
            db.session.query(Cbooktrade)
            .filter(Cbooktrade.cid==decoded_user_id, Cbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
            .order_by(Cbooktrade.bid.desc())
            .all()
        )
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    if not payment_book_results :
        pass
    else:
        for pyb in payment_book_results:
            if pyb.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2p, Personal)
                    .join(Personal, Preceipt2p.pid == Personal.pid)
                    .filter(Preceipt2p.orderid == pyb.orderid)
                    .first()
                )
            elif pyb.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2p, Commercial)
                    .join(Commercial, Creceipt2p.cid == Commercial.cid)
                    .filter(Creceipt2p.orderid == pyb.orderid)
                    .first()
                )
            else:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404

            if not receiptInfo:
                return jsonify({"error": "존재하지 않는 주문내역"}), 404
            
            receipt, owner = receiptInfo

            payment_book_list.append({
                "bid": pyb.bid,
                "title": pyb.title,
                "author": pyb.author,
                "publish": pyb.publish,
                "isbn": pyb.isbn,
                "price": pyb.price,
                "region": pyb.region,
                "bookimg": pyb.img1,
                "createAt": pyb.createAt.isoformat(),

                "state": pyb.state,
                "orderid": pyb.orderid,
                "consumerid": pyb.consumerid,
                "consumer_type": pyb.consumer_type,

                "rid": receipt.rid,
                "amount": receipt.amount,
                "installment_month": receipt.installment_months,
                "reason": receipt.reason,
                "payment_method": receipt.payment_method,
                "paidAt": receipt.paidAt.isoformat(),

                "ownerName": owner.name,
                "ownertel": owner.tel,
                "ownerEmail": owner.email,
                "ownerNickname": owner.nickname,
                "ownerRegion": owner.region,
                "ownerAddress": owner.address,
                "ownerType": pyb.consumer_type
            })
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "payment_book_list": payment_book_list,
    }), 201

@home_bp.route("/<int:userId>/my-page/check-payment-req", methods=["GET"])
@token_required
def show_payment_list(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    payment_group = {}
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        payment_results = (
            db.session.query(Ppayment)
            .filter(Ppayment.pid==decoded_user_id)
            .order_by(Ppayment.ppid.desc())
            .all()
        )
        
        # 정산 요청별로 해당 도서 목록을 조회하여 그룹핑
        for payment in payment_results:
            ppid = payment.ppid
            books = (
                db.session.query(Pbooktrade)
                .filter(Pbooktrade.ppid == ppid, Pbooktrade.pid == decoded_user_id)
                .all()
            )

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

            payment_group[ppid] = {
                "pyid": ppid,
                "price": payment.price,
                "state": payment.state,
                "completePhoto": payment.completePhoto if payment.completePhoto else None,
                "reason": payment.reason,
                "createAt": payment.createAt.isoformat(),
                "completedAt": payment.completedAt.isoformat() if payment.completedAt else None,
                "books": book_list
            }
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        payment_results = (
            db.session.query(Cpayment)
            .filter(Cpayment.cid==decoded_user_id)
            .order_by(Cpayment.cpid.desc())
            .all()
        )
        # 정산 요청별로 해당 도서 목록을 조회하여 그룹핑
        for payment in payment_results:
            cpid = payment.cpid
            books = (
                db.session.query(Cbooktrade)
                .filter(Cbooktrade.cpid == cpid, Cbooktrade.cid == decoded_user_id)
                .all()
            )

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

            payment_group[cpid] = {
                "pyid": cpid,
                "price": payment.price,
                "state": payment.state,
                "completePhoto": payment.completePhoto if payment.completePhoto else None,
                "reason": payment.reason,
                "createAt": payment.createAt.isoformat(),
                "completedAt": payment.completedAt.isoformat() if payment.completedAt else None,
                "books": book_list
            }
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "payment_group": list(payment_group.values())
    }), 200

@home_bp.route("/<int:userId>/my-page/check-payment-req/<int:pqid>", methods=["GET"])
@token_required
def show_payment_detail(decoded_user_id, user_type, userId, pqid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    book_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()

        payment_result = (
            db.session.query(Ppayment)
            .filter(Ppayment.ppid == pqid, Ppayment.pid==decoded_user_id)
            .first()
        )

        book_results = (
            db.session.query(Pbooktrade)
            .filter(Pbooktrade.ppid == pqid, Pbooktrade.pid == decoded_user_id)
            .all()
        )
        
        payment_info = {
            "pyid": payment_result.ppid,
            "price": payment_result.price,
            "state": payment_result.state,
            "completePhoto": payment_result.completePhoto if payment_result.completePhoto else None,
            "reason": payment_result.reason,
            "createAt": payment_result.createAt.isoformat(),
            "completedAt": payment_result.completedAt.isoformat() if payment_result.completedAt else None,
        }

        for book in book_results:
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
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()

        payment_result = (
            db.session.query(Cpayment)
            .filter(Cpayment.cpid == pqid, Cpayment.cid==decoded_user_id)
            .first()
        )

        book_results = (
            db.session.query(Cbooktrade)
            .filter(Cbooktrade.cpid == pqid, Cbooktrade.cid == decoded_user_id)
            .all()
        )
        
        payment_info = {
            "pyid": payment_result.cpid,
            "price": payment_result.price,
            "state": payment_result.state,
            "completePhoto": payment_result.completePhoto if payment_result.completePhoto else None,
            "reason": payment_result.reason,
            "createAt": payment_result.createAt.isoformat(),
            "completedAt": payment_result.completedAt.isoformat() if payment_result.completedAt else None,
        }

        for book in book_results:
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
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "payment_info": payment_info,
        "book_list": book_list
    }), 200