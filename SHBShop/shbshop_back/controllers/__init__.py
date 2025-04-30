from . import home, auth, start, admin, book, shop, test

blueprints = [
    (home.home_bp, "/home"),
    (auth.auth_bp, "/auth"),
    (start.start_bp, "/start"),
    (admin.admin_bp, "/admin"),
    (book.book_bp, "/book"),
    (shop.shop_bp, "/shop"),
    (test.test_bp, "/test")
]