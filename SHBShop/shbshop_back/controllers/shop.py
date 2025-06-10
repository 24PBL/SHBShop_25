from flask import Blueprint, request, jsonify
from enum import Enum
from sqlalchemy import desc, and_, or_, func
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename
from uuid import uuid4
import os
import pandas as pd
import requests
from dotenv import load_dotenv
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Favorite4p, Favorite4c, Preceipt2s, Creceipt2s, Spayment
from extensions import db

shop_bp = Blueprint("shop", __name__)

load_dotenv()

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class Favorite(Enum):
    YES = 1
    NO = 2

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

SBOOK_UPLOAD_FOLDER = "static/product/shop"
S_IMAGE_UPLOAD_FOLDER = "static/shop"

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

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
        isFavorite = Favorite.NO.value
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
                        Sbooktrade.state == PurchaseState.ONSALE.value,
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
        "sid": book.sid,
        "title": book.title,
        "author": book.author,
        "publish": book.publish,
        "isbn": book.isbn,
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

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock", methods=["GET"])
@token_required
def show_shop_stock(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sbook_list = []
    
    if user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

        if not shopInfo:
            return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
        
        stock_list = (
            db.session.query(Sbooktrade)
            .filter(Sbooktrade.sid==shopId, Sbooktrade.state==PurchaseState.ONSALE.value)
            .order_by(Sbooktrade.bid.desc())
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
            "createAt": book.createAt.isoformat()
        } for book in stock_list]
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "sbook_list": sbook_list
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/<int:finalBid>", methods=["GET"])
@token_required
def show_shop_stock_more(decoded_user_id, user_type, userId, shopId, finalBid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    sbook_list = []
    
    if user_type == UserType.COMMERCIAL.value:
        userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
        shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

        if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404

        if not shopInfo:
            return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404

        stock_list = (
            db.session.query(Sbooktrade)
            .filter(Sbooktrade.sid==shopId, Sbooktrade.state==PurchaseState.ONSALE.value, Sbooktrade.bid < finalBid)
            .order_by(Sbooktrade.bid.desc())
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
            "createAt": book.createAt.isoformat()
        } for book in stock_list]
    else:
        return jsonify({"error": "접근 권한 없음"}), 403
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "sbook_list": sbook_list
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/search", methods=["GET"])
@token_required
def search_shop_stock(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    keyword = request.args.get("keyword")
    if not keyword:
        return jsonify({"error": "검색어가 제공되지 않았습니다."}), 400

    keyword_pattern = f"%{keyword}%"
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    subquery = (
        db.session.query(
            Sbooktrade.isbn,
            func.max(Sbooktrade.bid).label("max_bid")
        )
        .filter(
            and_(
                Sbooktrade.sid == shopId,
                Sbooktrade.state==PurchaseState.ONSALE.value,
                or_(
                    Sbooktrade.title.ilike(keyword_pattern),
                    Sbooktrade.author.ilike(keyword_pattern),
                    Sbooktrade.publish.ilike(keyword_pattern),
                    Sbooktrade.isbn.ilike(keyword_pattern)
                )
            )
        )
        .group_by(Sbooktrade.isbn)
        .subquery()
    )

    stock_list = (
        db.session.query(Sbooktrade)
        .join(subquery, and_(
            Sbooktrade.isbn == subquery.c.isbn,
            Sbooktrade.bid == subquery.c.max_bid
        ))
        .order_by(Sbooktrade.bid.desc())
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
        "createAt": book.createAt.isoformat()
    } for book in stock_list]

    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "sbook_list": sbook_list
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/stock-list", methods=["GET"])
@token_required
def stock_list_by_isbn(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    # const encoded = encodeURIComponent(keyword); 프론트에서 쿼리값 인코딩 해주세요.
    isbn = request.args.get("isbn")
    if not isbn:
        return jsonify({"error": "isbn이 제공되지 않았습니다."}), 400

    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    stock_list = (
        db.session.query(Sbooktrade).
        filter(Sbooktrade.sid == shopId, Sbooktrade.isbn == isbn, Sbooktrade.state==PurchaseState.ONSALE.value,)
        .order_by(Sbooktrade.bid.desc())
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
        "createAt": book.createAt.isoformat()
    } for book in stock_list]

    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "sbook_list": sbook_list
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/detail/<int:bookId>", methods=["GET"])
@token_required
def show_my_product_detail(decoded_user_id, user_type, userId, shopId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    book = db.session.query(Sbooktrade).filter_by(bid=bookId, sid=shopId).first()
    
    if not book:
        return jsonify({"error": "해당 책이 존재하지 않습니다."}), 404
    
    if book.state != PurchaseState.ONSALE.value:
        return jsonify({"message": "판매 중인 재고가 아닙니다.", "book_info": 2}), 404
    
    book_info = {
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
        "createAt": book.createAt.isoformat()
    }
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "book_info": book_info
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/add-sbook", methods=["POST"])
@token_required
def add_my_s_product(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
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
    img1 = request.files.get("img1")
    img2 = request.files.get("img2")
    img3 = request.files.get("img3")

    if not all([img1, img2, img3]):
        return jsonify({"error": "모든 이미지 파일을 업로드해야 합니다."}), 400
    
    if not all([title, author, publish, isbn, price]):
        return jsonify({"error": "필수 필드 누락"}), 400
    
    filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
    save_path1 = os.path.join(SBOOK_UPLOAD_FOLDER, filename1)

    filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
    save_path2 = os.path.join(SBOOK_UPLOAD_FOLDER, filename2)

    filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
    save_path3 = os.path.join(SBOOK_UPLOAD_FOLDER, filename3)
        
    try:
        img1.save(save_path1)
        img2.save(save_path2)
        img3.save(save_path3)
    except Exception as e:
        return jsonify({"error": f"파일 저장 실패: {str(e)}"}), 500

    img_url1 = f"/{SBOOK_UPLOAD_FOLDER}/{filename1}"
    img_url2 = f"/{SBOOK_UPLOAD_FOLDER}/{filename2}"
    img_url3 = f"/{SBOOK_UPLOAD_FOLDER}/{filename3}"   

    new_sbook = Sbooktrade(
        sid = shopInfo.sid,
        title = title,
        author = author,
        publish = publish,
        isbn = isbn,
        price = price,
        detail = detail,
        region = shopInfo.region,
        img1 = img_url1,
        img2 = img_url2,
        img3 = img_url3
    )
    db.session.add(new_sbook)
    db.session.commit()

    # 책 추가 후 다시 재고 리스트를 띄우기 위한 데이터
    stock_list = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.sid==shopId, Sbooktrade.state==PurchaseState.ONSALE.value)
        .order_by(Sbooktrade.bid.desc())
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
            "createAt": book.createAt.isoformat()
        } for book in stock_list]
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "책 추가 완료", "sbook_list": sbook_list, "shop_info": shop_info, "user_info": user_info}), 201

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/<int:bookId>/delete-sbook", methods=["DELETE"])
@token_required
def delete_stock(decoded_user_id, user_type, userId, shopId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    bookInfo = db.session.query(Sbooktrade).filter_by(sid=shopId, bid=bookId).first()

    if not bookInfo:
        return jsonify({"error": "존재하지 않는 재고"}), 404
    
    if bookInfo.state != PurchaseState.ONSALE.value:
        return jsonify({"message": 2, "message2": "판매 중인 재고가 아닙니다."}), 404
    
    db.session.query(Sbooktrade).filter_by(sid=shopId, bid=bookId).delete()
    #db.session.delete(bookInfo)
    db.session.commit()
    
    # 책 추가 후 다시 재고 리스트를 띄우기 위한 데이터
    stock_list = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.sid==shopId, Sbooktrade.state==PurchaseState.ONSALE.value)
        .order_by(Sbooktrade.bid.desc())
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
            "createAt": book.createAt.isoformat()
        } for book in stock_list]
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "재고 삭제 완료", "sbook_list": sbook_list, "shop_info": shop_info, "user_info": user_info}), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/<int:bookId>/modify-sbook", methods=["POST"])
@token_required
def modify_stock(decoded_user_id, user_type, userId, shopId, bookId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    bookInfo = db.session.query(Sbooktrade).filter_by(bid=bookId, sid=shopId).first()
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
    img1 = request.files.get("img1")
    img2 = request.files.get("img2")
    img3 = request.files.get("img3")

    if not all([title, author, publish, isbn, price]):
        return jsonify({"error": "필수 필드 누락"}), 400

    if img1:
        filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
        save_path1 = os.path.join(SBOOK_UPLOAD_FOLDER, filename1)
        try:
            img1.save(save_path1)
            img_url1 = f"/{SBOOK_UPLOAD_FOLDER}/{filename1}"
        except Exception as e:
            return jsonify({"error": f"img1 저장 실패: {str(e)}"}), 500

    if img2:
        filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
        save_path2 = os.path.join(SBOOK_UPLOAD_FOLDER, filename2)
        try:
            img2.save(save_path2)
            img_url2 = f"/{SBOOK_UPLOAD_FOLDER}/{filename2}"
        except Exception as e:
            return jsonify({"error": f"img2 저장 실패: {str(e)}"}), 500

    if img3:
        filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
        save_path3 = os.path.join(SBOOK_UPLOAD_FOLDER, filename3)
        try:
            img3.save(save_path3)
            img_url3 = f"/{SBOOK_UPLOAD_FOLDER}/{filename3}"
        except Exception as e:
            return jsonify({"error": f"img3 저장 실패: {str(e)}"}), 500
        
    bookInfo.title = title
    bookInfo.author = author
    bookInfo.publish = publish
    bookInfo.isbn = isbn
    bookInfo.price = price
    bookInfo.detail = detail
    bookInfo.region = shopInfo.region
    bookInfo.img1 = img_url1
    bookInfo.img2 = img_url2
    bookInfo.img3 = img_url3  

    db.session.commit()

    # 책 추가 후 다시 재고 리스트를 띄우기 위한 데이터
    stock_list = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.sid==shopId, Sbooktrade.state==PurchaseState.ONSALE.value)
        .order_by(Sbooktrade.bid.desc())
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
            "createAt": book.createAt.isoformat()
        } for book in stock_list]
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "책 수정 완료", "sbook_list": sbook_list, "shop_info": shop_info, "user_info": user_info}), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-pr", methods=["GET"])
@token_required
def show_shop_sr(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    sr_results = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.sid == shopId, Sbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
        .all()
    )

    sr_order_id = [b.orderid for b in sr_results]

    prs_results = (
        db.session.query(Preceipt2s, Personal)
        .join(Personal, Preceipt2s.pid == Personal.pid)
        .filter(
            Preceipt2s.orderid.in_(sr_order_id)
        )
        .all()
    )

    crs_results = (
        db.session.query(Creceipt2s, Commercial)
        .join(Commercial, Creceipt2s.cid == Commercial.cid)
        .filter(
            Creceipt2s.orderid.in_(sr_order_id)
        )
        .all()
    )

    combined_list = []

    for re, ow in prs_results:
        combined_list.append({
            "rid": re.rid,
            "orderid": re.orderid,
            "amount": re.amount,
            "installment_month": re.installment_months,
            "state": re.state,
            "reason": re.reason,
            "payment_method": re.payment_method,
            "paidAt": re.paidAt,

            "ownerName": ow.name,
            "ownertel": ow.tel,
            "ownerEmail": ow.email,
            "ownerNickname": ow.nickname,
            "ownerRegion": ow.region,
            "ownerAddress": ow.address,
            "ownerType": UserType.PERSONAL.value
        })

    for re, ow in crs_results:
        combined_list.append({
            "rid": re.rid,
            "orderid": re.orderid,
            "amount": re.amount,
            "installment_month": re.installment_months,
            "state": re.state,
            "reason": re.reason,
            "payment_method": re.payment_method,
            "paidAt": re.paidAt,

            "ownerName": ow.name,
            "ownertel": ow.tel,
            "ownerEmail": ow.email,
            "ownerNickname": ow.nickname,
            "ownerRegion": ow.region,
            "ownerAddress": ow.address,
            "ownerType": UserType.COMMERCIAL.value
        })

    sb_list = [ {
        "bid": sb.bid,
        "title": sb.title,
        "author": sb.author,
        "publish": sb.publish,
        "isbn": sb.isbn,
        "price": sb.price,
        "region": sb.region,
        "bookimg": sb.img1,
        "consumerid": sb.consumerid,
        "consumer_type": sb.consumer_type,
        "orderid": sb.orderid
    } for sb in sr_results ]
    
    sorted_sr = sorted(combined_list, key=lambda x: x["paidAt"], reverse=True)

    for sr in sorted_sr:
        sr["paidAt"] = sr["paidAt"].isoformat()
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "receipt_list": sorted_sr,
        "book_list": sb_list
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-pr/<int:ownerType>/<int:rid>/<int:bid>", methods=["GET"])
@token_required
def show_shop_sr_detail(decoded_user_id, user_type, userId, shopId, ownerType, rid, bid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    if ownerType == UserType.PERSONAL.value:
        receiptInfo =  (
            db.session.query(Preceipt2s, Personal)
            .join(Personal, Preceipt2s.pid == Personal.pid)
            .filter(Preceipt2s.rid == rid)
            .first()
        )

        if not receiptInfo:
            return jsonify({"error": "해당 주문 정보가 존재하지 않습니다."}), 404

        receipt, owner = receiptInfo

        receipt_info = {
            "rid": receipt.rid,
            "orderid": receipt.orderid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "state": receipt.state,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat(),

            "ownerName": owner.name,
            "ownertel": owner.tel,
            "ownerEmail": owner.email,
            "ownerNickname": owner.nickname,
            "ownerRegion": owner.region,
            "ownerAddress": owner.address,
            "ownerType": UserType.PERSONAL.value
        }
    elif ownerType == UserType.COMMERCIAL.value:
        receiptInfo =  (
            db.session.query(Creceipt2s, Commercial)
            .join(Commercial, Creceipt2s.cid == Commercial.cid)
            .filter(Creceipt2s.rid == rid)
            .first()
        )

        if not receiptInfo:
            return jsonify({"error": "해당 주문 정보가 존재하지 않습니다."}), 404

        receipt, owner = receiptInfo

        receipt_info = {
            "rid": receipt.rid,
            "orderid": receipt.orderid,
            "amount": receipt.amount,
            "installment_month": receipt.installment_months,
            "state": receipt.state,
            "reason": receipt.reason,
            "payment_method": receipt.payment_method,
            "paidAt": receipt.paidAt.isoformat(),

            "ownerName": owner.name,
            "ownertel": owner.tel,
            "ownerEmail": owner.email,
            "ownerNickname": owner.nickname,
            "ownerRegion": owner.region,
            "ownerAddress": owner.address,
            "ownerType": UserType.COMMERCIAL.value
        }
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
    bookInfo = db.session.query(Sbooktrade).filter(Sbooktrade.bid == bid).first()

    if not bookInfo:
        return jsonify({"error": "책 정보가 존재하지 않습니다."}), 404

    if bookInfo.orderid != receipt.orderid:
        return jsonify({"error": "구매자 정보 오류"}), 400
    
    if bookInfo.state != PurchaseState.PAYMENT_SUCCESS.value:
        return jsonify({"error": "구매 완료되지 않음."}), 400

    book_info = {
        "bid": bookInfo.bid,
        "title": bookInfo.title,
        "author": bookInfo.author,
        "publish": bookInfo.publish,
        "isbn": bookInfo.isbn,
        "price": bookInfo.price,
        "region": bookInfo.region,
        "bookimg": bookInfo.img1,
        "consumerid": bookInfo.consumerid,
        "consumer_type": bookInfo.consumer_type,
        "orderid": bookInfo.orderid
    }
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
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
        "shop_info": shop_info,
        "receipt_info": receipt_info,
        "book_info": book_info
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/modify-shop-info", methods=["POST"])
@token_required
def modify_shop_info(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
            return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    img_url1 = shopInfo.shopimg1
    img_url2 = shopInfo.shopimg2
    img_url3 = shopInfo.shopimg3

    shoptel = request.form.get("shoptel")
    open = request.form.get("open")
    close = request.form.get("close")
    holiday = request.form.get("holiday")
    etc = request.form.get("etc")
    
    img1 = request.files.get("imgfile1")
    img2 = request.files.get("imgfile2")
    img3 = request.files.get("imgfile3")

    if not all([shoptel, open, close, holiday, etc]):
        return jsonify({"error": "필수 필드 누락"}), 400

    if img1:
        filename1 = secure_filename(f"{uuid4().hex}_{img1.filename}")
        save_path1 = os.path.join(S_IMAGE_UPLOAD_FOLDER, filename1)
        try:
            img1.save(save_path1)
            img_url1 = f"/{S_IMAGE_UPLOAD_FOLDER}/{filename1}"
        except Exception as e:
            return jsonify({"error": f"img1 저장 실패: {str(e)}"}), 500

    if img2:
        filename2 = secure_filename(f"{uuid4().hex}_{img2.filename}")
        save_path2 = os.path.join(S_IMAGE_UPLOAD_FOLDER, filename2)
        try:
            img2.save(save_path2)
            img_url2 = f"/{S_IMAGE_UPLOAD_FOLDER}/{filename2}"
        except Exception as e:
            return jsonify({"error": f"img2 저장 실패: {str(e)}"}), 500

    if img3:
        filename3 = secure_filename(f"{uuid4().hex}_{img3.filename}")
        save_path3 = os.path.join(S_IMAGE_UPLOAD_FOLDER, filename3)
        try:
            img3.save(save_path3)
            img_url3 = f"/{S_IMAGE_UPLOAD_FOLDER}/{filename3}"
        except Exception as e:
            return jsonify({"error": f"img3 저장 실패: {str(e)}"}), 500
        
    shopInfo.shoptel = shoptel
    shopInfo.open = open
    shopInfo.close = close
    shopInfo.holiday = holiday
    shopInfo.etc = etc
    shopInfo.shopimg1 = img_url1
    shopInfo.shopimg2 = img_url2
    shopInfo.shopimg3 = img_url3

    db.session.commit()
    
    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    return jsonify({"message": "매장 수정 완료", "shop_info": shop_info, "user_info": user_info}), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-stock/add-excel", methods=["POST"])
@token_required
def upload_books_from_excel(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "사업자만 등록 가능합니다."}), 403
    
    shopInfo = db.session.query(Shop).filter(Shop.sid == shopId, Shop.cid == decoded_user_id).first()

    if not shopInfo:
        return jsonify({"error": "매장 등록을 완료한 사업자만 등록 가능합니다."}), 403

    excel_file = request.files.get("excel")
    image_files = request.files.getlist("images")

    if not excel_file or not image_files:
        return jsonify({"error": "엑셀 또는 이미지 파일 누락"}), 400

    try:
        df = pd.read_excel(excel_file)
    except Exception as e:
        return jsonify({"error": f"엑셀 파싱 실패: {str(e)}"}), 500

    image_map = {secure_filename(f.filename): f for f in image_files}

    results = []
    success_count = 0

    for _, row in df.iterrows():
        isbn = str(row.get("isbn")).strip()
        img_names = [
            row.get("img1_path"),
            row.get("img2_path"),
            row.get("img3_path")
        ]
        price = row.get("price")
        detail = str(row.get("detail") or "").strip()
        saved_imgs = []

        # 이미지 저장
        for img_name in img_names:
            if not img_name or str(img_name).strip() == 'nan':
                results.append({"isbn": isbn, "status": f"이미지 경로 누락"})
                break
            safe_name = secure_filename(str(img_name).strip())
            file = image_map.get(safe_name)
            if not file:
                results.append({"isbn": isbn, "status": f"{safe_name} 이미지 없음"})
                break

            unique_name = f"{uuid4().hex}_{safe_name}"
            save_path = os.path.join(SBOOK_UPLOAD_FOLDER, unique_name)

            try:
                file.save(save_path)
                saved_imgs.append(f"/{SBOOK_UPLOAD_FOLDER}/{unique_name}")
            except Exception as e:
                results.append({"isbn": isbn, "status": f"{safe_name} 저장 실패: {str(e)}"})
                break
        else:
            # ISBN으로 네이버 도서 API 조회
            res = requests.get(
                "https://openapi.naver.com/v1/search/book.json",
                params={"query": isbn, "d_isbn": isbn},
                headers={
                    "X-Naver-Client-Id": NAVER_CLIENT_ID,
                    "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
                }
            )

            if res.status_code != 200 or not res.json().get("items"):
                results.append({"isbn": isbn, "status": "네이버 도서 검색 실패"})
                continue

            book_data = res.json()["items"][0]

            try:
                price = int(price)
            except (ValueError, TypeError):
                results.append({"isbn": isbn, "status": "가격 형식 오류"})
                continue

            new_book = Sbooktrade(
                sid=shopId,
                title=book_data["title"],
                author=book_data["author"],
                publish=book_data["publisher"],
                isbn=isbn,
                price=price,  # 기본 가격 설정 또는 row에서 받아와도 됨
                region=shopInfo.region,  # 기본 지역 설정
                detail=detail,
                img1=saved_imgs[0],
                img2=saved_imgs[1],
                img3=saved_imgs[2],
            )
            db.session.add(new_book)
            success_count += 1

    db.session.commit()

    return jsonify({
        "success_count": success_count,
        "failures": [r for r in results if r["status"] != "등록 성공"]
    }), 201

@shop_bp.route("/<int:userId>/<int:shopId>/check-payment", methods=["GET"])
@token_required
def show_shop_payment_book(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "사업자만 등록 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    shopInfo = db.session.query(Shop).filter(Shop.sid == shopId, Shop.cid == decoded_user_id).first()
    if not shopInfo:
        return jsonify({"error": "매장 등록을 완료한 사업자만 등록 가능합니다."}), 403
    
    payment_book_list = []

    payment_book_results = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.sid==shopId, Sbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
        .order_by(Sbooktrade.bid.desc())
        .all()
    )

    if not payment_book_results :
        pass
    else:
        for book in payment_book_results:
            if book.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2s, Personal)
                    .join(Personal, Preceipt2s.pid == Personal.pid)
                    .filter(Preceipt2s.orderid == book.orderid)
                    .first()
                )
            elif book.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2s, Commercial)
                    .join(Commercial, Creceipt2s.cid == Commercial.cid)
                    .filter(Creceipt2s.orderid == book.orderid)
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
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "shop_info": shop_info,
        "payment_book_list": payment_book_list
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-payment/req-payment", methods=["POST"])
@token_required
def request_spay(decoded_user_id, user_type, userId, shopId):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON 데이터가 없습니다."}), 400

    books = data.get("books")
    price = data.get("price")

    if not all([books, price is not None]):
        return jsonify({"error": "필수 항목 누락"}), 400

    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "사업자만 등록 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    shopInfo = db.session.query(Shop).filter(Shop.sid == shopId, Shop.cid == decoded_user_id).first()
    if not shopInfo:
        return jsonify({"error": "매장 등록을 완료한 사업자만 등록 가능합니다."}), 403
    
    if not books or not isinstance(books, list):
        return jsonify({"error": "책 목록이 유효하지 않습니다."}), 400
    
    server_cal_price = 0
    payment_book_list = []
    
    matched_books = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.bid.in_(books))
        .filter(Sbooktrade.sid == shopId)
        .all()
    )
    
    for eb in matched_books:
        if eb.state != PurchaseState.PAYMENT_SUCCESS.value:
            return jsonify({"error": "정산할 수 없는 도서 존재"}), 400
        server_cal_price += eb.price

    if int(price) != server_cal_price:
        return jsonify({"error": "총계 불일치"}), 400

    newPm = Spayment(
        sid=shopId,
        price=server_cal_price
    )
    
    db.session.add(newPm)
    db.session.flush()
    
    for book in matched_books:
        book.state = PurchaseState.CALCULATE.value
        book.spid = newPm.spid

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "서버 오류", "details": str(e)}), 500
    
    # 정산 신청 완료 후 다시 정산 가능 리스트를 띄우기 위한 데이터 응답
    payment_book_results = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.sid==shopId, Sbooktrade.state == PurchaseState.PAYMENT_SUCCESS.value)
        .order_by(Sbooktrade.bid.desc())
        .all()
    )
    
    if not payment_book_results :
        pass
    else:
        for pyb in payment_book_results:
            if pyb.consumer_type == UserType.PERSONAL.value:
                receiptInfo = (
                    db.session.query(Preceipt2s, Personal)
                    .join(Personal, Preceipt2s.pid == Personal.pid)
                    .filter(Preceipt2s.orderid == pyb.orderid)
                    .first()
                )
            elif pyb.consumer_type == UserType.COMMERCIAL.value:
                receiptInfo = (
                    db.session.query(Creceipt2s, Commercial)
                    .join(Commercial, Creceipt2s.cid == Commercial.cid)
                    .filter(Creceipt2s.orderid == pyb.orderid)
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

    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "shop_info": shop_info,
        "payment_book_list": payment_book_list,
    }), 201

@shop_bp.route("/<int:userId>/<int:shopId>/check-payment-req", methods=["GET"])
@token_required
def show_spayment_list(decoded_user_id, user_type, userId, shopId):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "사업자만 등록 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    shopInfo = db.session.query(Shop).filter(Shop.sid == shopId, Shop.cid == decoded_user_id).first()
    if not shopInfo:
        return jsonify({"error": "매장 등록을 완료한 사업자만 등록 가능합니다."}), 403
    
    payment_group = {}
    
    payment_results = (
        db.session.query(Spayment)
        .filter(Spayment.sid==shopId)
        .order_by(Spayment.spid.desc())
        .all()
    )
        
    # 정산 요청별로 해당 도서 목록을 조회하여 그룹핑
    for payment in payment_results:
        spid = payment.spid
        books = (
            db.session.query(Sbooktrade)
            .filter(Sbooktrade.spid == spid, Sbooktrade.sid == shopId)
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

        payment_group[spid] = {
            "pyid": spid,
            "price": payment.price,
            "state": payment.state,
            "completePhoto": payment.completePhoto if payment.completePhoto else None,
            "reason": payment.reason,
            "createAt": payment.createAt.isoformat(),
            "completedAt": payment.completedAt.isoformat() if payment.completedAt else None,
            "books": book_list
        }

    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }
    
    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "shop_info": shop_info,
        "payment_group": list(payment_group.values())
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-payment-req/<int:pqid>", methods=["GET"])
@token_required
def show_spayment_detail(decoded_user_id, user_type, userId, shopId, pqid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403
    
    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "사업자만 등록 가능합니다."}), 403
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404
    
    shopInfo = db.session.query(Shop).filter(Shop.sid == shopId, Shop.cid == decoded_user_id).first()
    if not shopInfo:
        return jsonify({"error": "매장 등록을 완료한 사업자만 등록 가능합니다."}), 403
    
    book_list = []

    payment_result = (
        db.session.query(Spayment)
        .filter(Spayment.spid == pqid, Spayment.sid==shopId)
        .first()
    )

    book_results = (
        db.session.query(Sbooktrade)
        .filter(Sbooktrade.spid == pqid, Sbooktrade.sid == shopId)
        .all()
    )
        
    payment_info = {
        "pyid": payment_result.spid,
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
    
    user_info = {
        "name": userInfo.name,
        "birth": userInfo.birth,
        "tel": userInfo.tel,
        "email": userInfo.email,
        "nickname": userInfo.nickname,
        "address": userInfo.address
    }

    shop_info = {
        "shopId": shopInfo.sid,
        "shopName": shopInfo.shopName,
        "address": shopInfo.address,
        "region": shopInfo.region
    }

    return jsonify({
        "decoded_user_id": decoded_user_id,
        "user_type": user_type,
        "user_info": user_info,
        "shop_info": shop_info,
        "payment_info": payment_info,
        "book_list": book_list
    }), 200