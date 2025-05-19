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

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Favorite4p, Favorite4c, Commercialcert, Vaild4pmd, Vaild4cmd, Modiaddress, Pbasket2p, Pbasket2c, Pbasket2s, Cbasket2p, Cbasket2c, Cbasket2s, Preceipt2p, Preceipt2c, Preceipt2s, Creceipt2p, Creceipt2c, Creceipt2s 
from extensions import db

home_bp = Blueprint("home", __name__)

LICENCE_UPLOAD_FOLDER = "static/licence"
S_IMAGE_UPLOAD_FOLDER = "static/shop"
P_PROFILE_UPLOAD_FOLDER = "static/user/personal"
C_PROFILE_UPLOAD_FOLDER = "static/user/commercial"

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class CoUserType(Enum):
    JUSTUSER = 1
    SHOPUSER = 2

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
        .filter(Pbooktrade.region == userInfo.region)
        .order_by(Pbooktrade.createAt.desc())
        .limit(5)
        .all()
    )

    cbook_results = (
        db.session.query(Cbooktrade, Commercial.nickname)
        .join(Commercial, Cbooktrade.cid == Commercial.cid)
        .filter(Cbooktrade.region == userInfo.region)
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
            Pbooktrade.bid < pfinidx
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
            Cbooktrade.bid < cfinidx
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
                    or_(
                        Pbooktrade.title.ilike(keyword_pattern),
                        Pbooktrade.author.ilike(keyword_pattern),
                        Pbooktrade.publish.ilike(keyword_pattern)
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

        sbook_results = (
            db.session.query(Sbooktrade, Shop.shopName)
                .join(Shop, Sbooktrade.sid == Shop.sid)
                .filter(
                    or_(
                        Sbooktrade.title.ilike(keyword_pattern),
                        Sbooktrade.author.ilike(keyword_pattern),
                        Sbooktrade.publish.ilike(keyword_pattern)
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
        "profile": userData.img
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
        "state": cert.state,
        "reason": cert.reason,
        "createAt": cert.createAt.isoformat(),
        "licence": cert.licence
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
    licence = request.files.get("licence")

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

    region = address.split()[0] + "-" + address.split()[1]

    userData.name = name
    userData.presidentName = presidentName
    userData.businessmanName = businessmanName
    userData.businessEmail = businessEmail
    userData.coNumber = coNumber
    userData.address = address
    userData.region = region
    userData.licence = pdf_url

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
        licence=pdf_url,
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

    if not all([randomCode, tel, nickname, address]):
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
    
    combined_list = []
    sbook_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        prp_results = (
            db.session.query(Preceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Preceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .order_by(Preceipt2p.rid.desc())
            .limit(6)
            .all()
        )

        prc_results = (
            db.session.query(Preceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Preceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .order_by(Preceipt2c.rid.desc())
            .limit(6)
            .all()
        )

        prs_results = (
            db.session.query(Preceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Preceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .order_by(Preceipt2s.rid.desc())
            .limit(6)
            .all()
        )

        for receipt, book, seller in prp_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for receipt, book, seller in prc_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        } for receipt, book, shop in prs_results ]
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        crp_results = (
            db.session.query(Creceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Creceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .order_by(Creceipt2p.rid.desc())
            .limit(6)
            .all()
        )

        crc_results = (
            db.session.query(Creceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Creceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .order_by(Creceipt2c.rid.desc())
            .limit(6)
            .all()
        )

        crs_results = (
            db.session.query(Creceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Creceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .order_by(Creceipt2s.rid.desc())
            .limit(6)
            .all()
        )

        for receipt, book, seller in crp_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for receipt, book, seller in crc_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        } for receipt, book, shop in crs_results ]
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

@home_bp.route("/<int:userId>/my-page/show-receipt/<int:fnlPRid>/<int:fnlCRid>/<int:fnlSRid>", methods=["GET"])
@token_required
def show_user_receipt_more(decoded_user_id, user_type, userId, fnlPRid, fnlCRid, fnlSRid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    combined_list = []
    sbook_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        prp_results = (
            db.session.query(Preceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Preceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(Preceipt2p.rid < fnlPRid)
            .order_by(Preceipt2p.rid.desc())
            .limit(6)
            .all()
        )

        prc_results = (
            db.session.query(Preceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Preceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(Preceipt2c.rid < fnlCRid)
            .order_by(Preceipt2c.rid.desc())
            .limit(6)
            .all()
        )

        prs_results = (
            db.session.query(Preceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Preceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(Preceipt2s.rid < fnlSRid)
            .order_by(Preceipt2s.rid.desc())
            .limit(6)
            .all()
        )

        for receipt, book, seller in prp_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for receipt, book, seller in prc_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        } for receipt, book, shop in prs_results ]
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        crp_results = (
            db.session.query(Creceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Creceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(Creceipt2p.rid < fnlPRid)
            .order_by(Creceipt2p.rid.desc())
            .limit(6)
            .all()
        )

        crc_results = (
            db.session.query(Creceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Creceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(Creceipt2c.rid < fnlCRid)
            .order_by(Creceipt2c.rid.desc())
            .limit(6)
            .all()
        )

        crs_results = (
            db.session.query(Creceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Creceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(Creceipt2s.rid < fnlSRid)
            .order_by(Creceipt2s.rid.desc())
            .limit(6)
            .all()
        )

        for receipt, book, seller in crp_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for receipt, book, seller in crc_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        } for receipt, book, shop in crs_results ]
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

@home_bp.route("/<int:userId>/my-page/show-receipt/search", methods=["GET"])
@token_required
def search_receipt(decoded_user_id, user_type, userId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400

    keyword_pattern = f"%{keyword}%"

    combined_list = []
    sbook_list = []
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
        prp_results = (
            db.session.query(Preceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Preceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(
                or_(
                        Pbooktrade.title.ilike(keyword_pattern),
                        Pbooktrade.author.ilike(keyword_pattern),
                        Pbooktrade.publish.ilike(keyword_pattern),
                        Personal.name.ilike(keyword_pattern),
                        Personal.nickname.ilike(keyword_pattern)
                    )
            )
            .order_by(Preceipt2p.rid.desc())
            .all()
        )

        prc_results = (
            db.session.query(Preceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Preceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(
                or_(
                        Cbooktrade.title.ilike(keyword_pattern),
                        Cbooktrade.author.ilike(keyword_pattern),
                        Cbooktrade.publish.ilike(keyword_pattern),
                        Commercial.name.ilike(keyword_pattern),
                        Commercial.nickname.ilike(keyword_pattern)
                    )
            )
            .order_by(Preceipt2c.rid.desc())
            .all()
        )

        prs_results = (
            db.session.query(Preceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Preceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(
                or_(
                        Sbooktrade.title.ilike(keyword_pattern),
                        Sbooktrade.author.ilike(keyword_pattern),
                        Sbooktrade.publish.ilike(keyword_pattern),
                        Shop.shopName.ilike(keyword_pattern)
                    )
            )
            .order_by(Preceipt2s.rid.desc())
            .all()
        )

        for receipt, book, seller in prp_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for receipt, book, seller in prc_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        } for receipt, book, shop in prs_results ]
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        crp_results = (
            db.session.query(Creceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Creceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(
                or_(
                        Pbooktrade.title.ilike(keyword_pattern),
                        Pbooktrade.author.ilike(keyword_pattern),
                        Pbooktrade.publish.ilike(keyword_pattern),
                        Personal.name.ilike(keyword_pattern),
                        Personal.nickname.ilike(keyword_pattern)
                    )
            )
            .order_by(Creceipt2p.rid.desc())
            .all()
        )

        crc_results = (
            db.session.query(Creceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Creceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(
                or_(
                        Cbooktrade.title.ilike(keyword_pattern),
                        Cbooktrade.author.ilike(keyword_pattern),
                        Cbooktrade.publish.ilike(keyword_pattern),
                        Commercial.name.ilike(keyword_pattern),
                        Commercial.nickname.ilike(keyword_pattern)
                    )
            )
            .order_by(Creceipt2c.rid.desc())
            .all()
        )

        crs_results = (
            db.session.query(Creceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Creceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(
                or_(
                        Sbooktrade.title.ilike(keyword_pattern),
                        Sbooktrade.author.ilike(keyword_pattern),
                        Sbooktrade.publish.ilike(keyword_pattern),
                        Shop.shopName.ilike(keyword_pattern)
                    )
            )
            .order_by(Creceipt2s.rid.desc())
            .all()
        )

        for receipt, book, seller in crp_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.PERSONAL.value
            })

        for receipt, book, seller in crc_results:
            combined_list.append({
                "rid": receipt.rid,
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
                "state": receipt.state,
                "reason": receipt.reason,
                "createAt": receipt.createAt,
                "sellerType": UserType.COMMERCIAL.value
            })

        book_list = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

        for book in book_list:
            book["createAt"] = book["createAt"].isoformat()

        sbook_list = [ {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        } for receipt, book, shop in crs_results ]
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

@home_bp.route("/<int:userId>/my-page/show-receipt/detail/<int:sellerType>/<int:rid>", methods=["GET"])
@token_required
def show_user_receipt_detail(decoded_user_id, user_type, userId, sellerType, rid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    
    if (user_type == UserType.PERSONAL.value) and (sellerType == UserType.PERSONAL.value):
        receiptInfo = (
            db.session.query(Preceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Preceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(Preceipt2p.pid == userId, Preceipt2p.rid == rid)
            .first()
        )
    elif (user_type == UserType.PERSONAL.value) and (sellerType == UserType.COMMERCIAL.value):
        receiptInfo = (
            db.session.query(Preceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Preceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(Preceipt2c.pid == userId, Preceipt2c.rid == rid)
            .first()
        )
    elif (user_type == UserType.PERSONAL.value) and (sellerType == 3):
        receiptInfo = (
            db.session.query(Preceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Preceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(Preceipt2s.pid == userId, Preceipt2s.rid == rid)
            .first()
        )
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.PERSONAL.value):
        receiptInfo = (
            db.session.query(Creceipt2p, Pbooktrade, Personal)
            .join(Pbooktrade, Creceipt2p.bid == Pbooktrade.bid)
            .join(Personal, Pbooktrade.pid == Personal.pid)
            .filter(Creceipt2p.cid == userId, Creceipt2p.rid == rid)
            .first()
        )
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.COMMERCIAL.value):
        receiptInfo = (
            db.session.query(Creceipt2c, Cbooktrade, Commercial)
            .join(Cbooktrade, Creceipt2c.bid == Cbooktrade.bid)
            .join(Commercial, Cbooktrade.cid == Commercial.cid)
            .filter(Creceipt2c.cid == userId, Creceipt2c.rid == rid)
            .first()
        )
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == 3):
        receiptInfo = (
            db.session.query(Creceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Creceipt2s.bid == Sbooktrade.bid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(Creceipt2s.cid == userId, Creceipt2s.rid == rid)
            .first()
        )
    else:
       return jsonify({"error": "잘못된 접근"}), 403

    if not receiptInfo:
        return jsonify({"error": "해당 영수증 정보를 찾을 수 없습니다."}), 404
    
    if sellerType == 1:
        receipt, book, seller = receiptInfo

        serialized = {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat(),
            "sellerType": UserType.PERSONAL.value
        }
    elif sellerType == 2:
        receipt, book, seller = receiptInfo

        serialized = {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat(),
            "sellerType": UserType.COMMERCIAL.value
        }
    elif sellerType == 3:
        receipt, book, shop = receiptInfo

        serialized = {
            "rid": receipt.rid,
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
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat()
        }
    else:
        return jsonify({"error": "잘못된 판매 유형"}), 404
    
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
        "receipt_info": serialized
    }), 200

@home_bp.route("/<int:userId>/my-page/show-receipt/detail/<int:sellerType>/<int:rid>/complete", methods=["PUT"])
@token_required
def complete_sell(decoded_user_id, user_type, userId, sellerType, rid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type == UserType.PERSONAL.value:
        userInfo = db.session.query(Personal).filter_by(pid=decoded_user_id).first()
    elif user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    
    if (user_type == UserType.PERSONAL.value) and (sellerType == UserType.PERSONAL.value):
        receiptInfo = db.session.query(Preceipt2p).filter_by(pid = userId, rid = rid).first()
        bookInfo = db.session.query(Pbooktrade).filter_by(bid=receiptInfo.bid).first()
    elif (user_type == UserType.PERSONAL.value) and (sellerType == UserType.COMMERCIAL.value):
        receiptInfo = db.session.query(Preceipt2c).filter_by(pid = userId, rid = rid).first()
        bookInfo = db.session.query(Cbooktrade).filter_by(bid=receiptInfo.bid).first()
    elif (user_type == UserType.PERSONAL.value) and (sellerType == 3):
        receiptInfo = db.session.query(Preceipt2s).filter_by(pid = userId, rid = rid).first()
        bookInfo = db.session.query(Sbooktrade).filter_by(bid=receiptInfo.bid).first()
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.PERSONAL.value):
        receiptInfo = db.session.query(Creceipt2p).filter_by(cid = userId, rid = rid).first()
        bookInfo = db.session.query(Pbooktrade).filter_by(bid=receiptInfo.bid).first()
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == UserType.COMMERCIAL.value):
        receiptInfo = db.session.query(Creceipt2c).filter_by(cid = userId, rid = rid).first()
        bookInfo = db.session.query(Cbooktrade).filter_by(bid=receiptInfo.bid).first()
    elif (user_type == UserType.COMMERCIAL.value) and (sellerType == 3):
        receiptInfo = db.session.query(Creceipt2s).filter_by(cid = userId, rid = rid).first()
        bookInfo = db.session.query(Sbooktrade).filter_by(bid=receiptInfo.bid).first()
    else:
       return jsonify({"error": "잘못된 접근"}), 403
    
    if not receiptInfo:
        return jsonify({"error": "해당 영수증 정보를 찾을 수 없습니다."}), 404
    
    if not bookInfo:
        return jsonify({"error": "해당 책 정보를 찾을 수 없습니다."}), 404
    
    if receiptInfo.state == 2:
        receiptInfo.state = 4
        receiptInfo.reason = "구매 확정 완료"
        db.session.commit()
    else:
        return jsonify({"error": "구매 확정 할 수 없는 내역"}), 403
    
    return jsonify({"message": "구매 확정 성공", "decoded_user_id": decoded_user_id, "user_type": user_type}), 200