from flask import Blueprint, request, jsonify
from enum import Enum
from sqlalchemy import desc, and_, or_, func
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename
from uuid import uuid4
import os
from utils.jwt_helper import token_required

from models import Personal, Commercial, Pbooktrade, Sbooktrade, Cbooktrade, Shop, Favorite4p, Favorite4c, Preceipt2s, Creceipt2s
from extensions import db

shop_bp = Blueprint("shop", __name__)

class UserType(Enum):
    PERSONAL = 1
    COMMERCIAL = 2
    ADMIN = 3

class Favorite(Enum):
    YES = 1
    NO = 2

SBOOK_UPLOAD_FOLDER = "static/product/shop"
S_IMAGE_UPLOAD_FOLDER = "static/shop"

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
        
        stock_list = db.session.query(Sbooktrade).filter_by(sid=shopId).order_by(Sbooktrade.bid.desc()).limit(10).all()

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
        
        stock_list = db.session.query(Sbooktrade).filter(Sbooktrade.sid == shopId, Sbooktrade.bid < finalBid).order_by(Sbooktrade.bid.desc()).limit(10).all()

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
    
    stock_list = db.session.query(Sbooktrade).filter(Sbooktrade.sid == shopId, Sbooktrade.isbn == isbn).order_by(Sbooktrade.bid.desc()).all()

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
    stock_list = db.session.query(Sbooktrade).filter_by(sid=shopId).order_by(Sbooktrade.bid.desc()).limit(10).all()

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
    
    db.session.query(Sbooktrade).filter_by(sid=shopId, bid=bookId).delete()
    #db.session.delete(bookInfo)
    db.session.commit()
    
    # 책 추가 후 다시 재고 리스트를 띄우기 위한 데이터
    stock_list = db.session.query(Sbooktrade).filter_by(sid=shopId).order_by(Sbooktrade.bid.desc()).limit(10).all()

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
    stock_list = db.session.query(Sbooktrade).filter_by(sid=shopId).order_by(Sbooktrade.bid.desc()).limit(10).all()

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
    
    sr_list_p = (
        db.session.query(Preceipt2s, Sbooktrade, Shop)
        .join(Sbooktrade, Preceipt2s.shopid == Sbooktrade.sid)
        .filter(Preceipt2s.shopid == shopId)
        .order_by(Sbooktrade.bid.desc())
        .limit(5)
        .all()
    )
    
    sr_list_c = (
        db.session.query(Creceipt2s, Sbooktrade, Shop)
        .join(Sbooktrade, Creceipt2s.shopid == Sbooktrade.sid)
        .filter(Creceipt2s.shopid == shopId)
        .order_by(Sbooktrade.bid.desc())
        .limit(5)
        .all()
    )

    combined_list = []

    for pr, sb in sr_list_p:
        pr_owner = db.session.query(Personal).filter(Personal.pid == pr.pid).first()
        combined_list.append({
            "rid": pr.rid,
            "bid": sb.bid,
            "title": sb.title,
            "author": sb.author,
            "publish": sb.publish,
            "isbn": sb.isbn,
            "price": sb.price,
            "region": sb.region,
            "bookimg": sb.img1,
            "sid": shopInfo.sid,
            "shopName": shopInfo.shopName,
            "state": pr.state,
            "reason": pr.reason,
            "createAt": pr.createAt,
            "ownerName": pr_owner.name,
            "ownertel": pr_owner.tel,
            "ownerEmail": pr_owner.email,
            "ownerNickname": pr_owner.nickname,
            "ownerRegion": pr_owner.region,
            "ownerAddress": pr_owner.address,
            "ownerType": UserType.PERSONAL.value
        })

    for cr, sb in sr_list_c:
        cr_owner = db.session.query(Commercial).filter(Commercial.cid == cr.cid).first()
        combined_list.append({
            "rid": cr.rid,
            "bid": sb.bid,
            "title": sb.title,
            "author": sb.author,
            "publish": sb.publish,
            "isbn": sb.isbn,
            "price": sb.price,
            "region": sb.region,
            "bookimg": sb.img1,
            "sid": shopInfo.sid,
            "shopName": shopInfo.shopName,
            "state": cr.state,
            "reason": cr.reason,
            "createAt": cr.createAt,
            "ownerName": cr_owner.name,
            "ownertel": cr_owner.tel,
            "ownerEmail": cr_owner.email,
            "ownerNickname": cr_owner.nickname,
            "ownerRegion": cr_owner.region,
            "ownerAddress": cr_owner.address,
            "ownerType": UserType.COMMERCIAL.value
        })
    
    sorted_sr = sorted(combined_list, key=lambda x: x["createAt"], reverse=True)

    for sr in sorted_sr:
        sr["createAt"] = sr["createAt"].isoformat()
    
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
        "receipt_list": sorted_sr
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-pr/<int:ownerType>/<int:rid>", methods=["GET"])
@token_required
def show_shop_sr_detail(decoded_user_id, user_type, userId, shopId, ownerType, rid):
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
        receiptInfo = (
            db.session.query(Preceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Preceipt2s.shopid == Sbooktrade.sid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(Preceipt2s.shopid == shopId, Preceipt2s.rid == rid)
            .first()
        )

        if not receiptInfo:
            return jsonify({"error": "해당 주문 정보가 존재하지 않습니다."}), 404

        ownerInfo = db.session.query(Personal).filter_by(pid=receiptInfo.pid).first()

        if not ownerInfo:
            return jsonify({"error": "구매자 정보가 존재하지 않습니다."}), 404

        receipt, book, shop = receiptInfo

        serialized = {
            "rid": receipt.rid,
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "detail": book.detail,
            "region": book.region,
            "bookimg": book.img1,
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat(),
            "ownerType": UserType.PERSONAL.value,
            "ownerId": ownerInfo.pid,
            "ownerName": ownerInfo.name,
            "ownertel": ownerInfo.tel,
            "ownerEmail": ownerInfo.email,
            "ownerNickname": ownerInfo.nickname,
            "ownerRegion": ownerInfo.region,
            "ownerAddress": ownerInfo.address
        }
    elif ownerType == UserType.COMMERCIAL.value:
        receiptInfo = (
            db.session.query(Creceipt2s, Sbooktrade, Shop)
            .join(Sbooktrade, Creceipt2s.shopid == Sbooktrade.sid)
            .join(Shop, Sbooktrade.sid == Shop.sid)
            .filter(Creceipt2s.shopid == shopId, Creceipt2s.rid == rid)
            .first()
        )

        if not receiptInfo:
            return jsonify({"error": "해당 주문 정보가 존재하지 않습니다."}), 404

        ownerInfo = db.session.query(Commercial).filter_by(cid=receiptInfo.cid).first()

        if not ownerInfo:
            return jsonify({"error": "구매자 정보가 존재하지 않습니다."}), 404

        receipt, book, shop = receiptInfo

        serialized = {
            "rid": receipt.rid,
            "bid": book.bid,
            "title": book.title,
            "author": book.author,
            "publish": book.publish,
            "isbn": book.isbn,
            "price": book.price,
            "detail": book.detail,
            "region": book.region,
            "bookimg": book.img1,
            "state": receipt.state,
            "reason": receipt.reason,
            "createAt": receipt.createAt.isoformat(),
            "ownerType": UserType.COMMERCIAL.value,
            "ownerId": ownerInfo.cid,
            "ownerName": ownerInfo.name,
            "ownertel": ownerInfo.tel,
            "ownerEmail": ownerInfo.email,
            "ownerNickname": ownerInfo.nickname,
            "ownerRegion": ownerInfo.region,
            "ownerAddress": ownerInfo.address
        }
    else:
        return jsonify({"error": "잘못된 유저 유형"}), 404
    
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
        "receipt_info": serialized
    }), 200

@shop_bp.route("/<int:userId>/<int:shopId>/check-pr/<int:ownerType>/<int:rid>/review", methods=["PUT"])
@token_required
def sr_review(decoded_user_id, user_type, userId, shopId, ownerType, rid):
    if str(decoded_user_id) != str(userId):
        return jsonify({"error": "권한이 없습니다."}), 403

    if user_type != UserType.COMMERCIAL.value:
        return jsonify({"error": "상업회원만 접근 가능합니다."}), 403
    
    data = request.get_json()
    decision = data.get("decision")
    try:
        decision = int(decision)
    except ValueError:
        return jsonify({"error": "가격 형식이 올바르지 않습니다."}), 400
    reason = data.get("reason")
    
    userInfo = db.session.query(Commercial).filter_by(cid=decoded_user_id).first()
    shopInfo = db.session.query(Shop).filter_by(cid=decoded_user_id, sid=shopId).first()

    if not userInfo:
        return jsonify({"error": "존재하지 않는 회원"}), 404

    if not shopInfo:
        return jsonify({"error": "매장 정보가 존재하지 않습니다."}), 404
    
    if ownerType == UserType.PERSONAL.value:
        receiptInfo = db.session.query(Preceipt2s).filter(Preceipt2s.shopid == shopId, Preceipt2s.rid == rid).first()        
    elif ownerType == UserType.COMMERCIAL.value:
        receiptInfo = db.session.query(Creceipt2s).filter(Creceipt2s.shopid == shopId, Creceipt2s.rid == rid).first()
    else:
       return jsonify({"error": "잘못된 구매자 유형"}), 404 

    if not receiptInfo:
        return jsonify({"error": "해당 주문 정보가 존재하지 않습니다."}), 404
    
    if receiptInfo.state != 1:
        return jsonify({"error": "이미 처리된 요청입니다."}), 403
    
    if decision == 2:
        receiptInfo.state = 2
    elif decision == 3:
        receiptInfo.state = 3
    else:
        return jsonify({"error": "유효하지 않은 결정입니다."}), 400
    
    receiptInfo.reason = reason
    db.session.commit()
    
     # 책 추가 후 다시 재고 리스트를 띄우기 위한 데이터
    stock_list = db.session.query(Sbooktrade).filter_by(sid=shopId).order_by(Sbooktrade.bid.desc()).limit(10).all()

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
        "stock": sbook_list
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