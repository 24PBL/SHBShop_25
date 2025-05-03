from flask import Blueprint, request, jsonify
from enum import Enum
from sqlalchemy import desc, and_, or_
from sqlalchemy.orm import joinedload
import os
from werkzeug.utils import secure_filename
from uuid import uuid4
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Favorite4p, Favorite4c, Commercialcert
from extensions import db

home_bp = Blueprint("home", __name__)

LICENCE_UPLOAD_FOLDER = "static/licence"
S_IMAGE_UPLOAD_FOLDER = "static/shop"

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

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
            "price": book.price,
            "region": book.region,
            "bookimg": book.img1,
            "nickname": nickname,
            "createAt": book.createAt,
            "userType": UserType.COMMERCIAL.value
        })
    
    sbook_list = [{
        "bid": book.bid,
        "title": book.title,
        "author": book.author,
        "publish": book.publish,
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
        "title": book.title,
        "author": book.author,
        "publish": book.publish,
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
        return jsonify({"message": "즐겨찾기 추가 성공", "decoded_user_id": decoded_user_id, "user_type": user_type,}), 201
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
    elif user_type == UserType.COMMERCIAL.value:
        userData = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
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

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "user_info": userInfo}), 200

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

    return jsonify({"decoded_user_id": decoded_user_id, "user_type": user_type, "user_info": userInfo, "cert_list": cert_list}), 200

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