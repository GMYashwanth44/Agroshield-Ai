import random
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Product, Seller, CartItem, Order, OrderItem, User, Notification
from app.schemas.schemas import CartItemAdd, OrderCreate
from app.api.auth import get_current_user

router = APIRouter(prefix="/marketplace", tags=["Agriculture Marketplace & AI Smart Shopping"])

@router.get("/products")
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    disease_target: Optional[str] = None,
    sort_by: Optional[str] = "rating", # rating, price_asc, price_desc
    db: Session = Depends(get_db)
):
    """
    Search and filter products across seeds, fertilizers, crop protection, equipment, and tools.
    Supports AI Smart Shopping linking target diseases directly to appropriate product categories.
    """
    q = db.query(Product)
    if category and category != "all":
        q = q.filter(Product.category == category)
    if search:
        q = q.filter(Product.title.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
    if disease_target:
        q = q.filter(Product.target_diseases.ilike(f"%{disease_target}%"))

    if sort_by == "price_asc":
        q = q.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        q = q.order_by(Product.price.desc())
    else:
        q = q.order_by(Product.rating.desc())

    products = q.all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "brand": p.brand,
            "category": p.category,
            "price": p.price,
            "unit": p.unit,
            "rating": p.rating,
            "stock": p.stock,
            "image_url": p.image_url,
            "description": p.description,
            "safety_label": p.safety_label,
            "target_diseases": p.target_diseases,
            "seller_id": p.seller_id,
            "seller_name": p.seller.shop_name if p.seller else "AgroShield Verified Store",
            "allow_pickup": p.allow_pickup,
            "allow_delivery": p.allow_delivery
        }
        for p in products
    ]

@router.get("/products/{id}")
def get_product_details(id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": p.id,
        "title": p.title,
        "brand": p.brand,
        "category": p.category,
        "price": p.price,
        "unit": p.unit,
        "rating": p.rating,
        "stock": p.stock,
        "image_url": p.image_url,
        "description": p.description,
        "safety_label": p.safety_label,
        "active_ingredient": p.active_ingredient,
        "target_diseases": p.target_diseases,
        "seller": {
            "id": p.seller.id,
            "shop_name": p.seller.shop_name,
            "district": p.seller.district,
            "state": p.seller.state,
            "phone": p.seller.phone,
            "is_verified": p.seller.is_verified,
            "rating": p.seller.rating,
            "pickup_address": p.seller.pickup_address
        } if p.seller else None
    }

@router.get("/sellers")
def get_sellers(db: Session = Depends(get_db)):
    sellers = db.query(Seller).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "shop_name": s.shop_name,
            "district": s.district,
            "state": s.state,
            "rating": s.rating,
            "is_verified": s.is_verified,
            "pickup_address": s.pickup_address,
            "product_count": len(s.products)
        }
        for s in sellers
    ]

# Cart Endpoints
@router.post("/cart")
def add_to_cart(
    item: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item.product_id
    ).first()

    if existing:
        existing.quantity += item.quantity
    else:
        new_item = CartItem(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_item)

    db.commit()
    return {"status": "success", "message": "Product added to cart"}

@router.get("/cart")
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    total = sum(i.quantity * (i.product.price if i.product else 0) for i in items)
    return {
        "items": [
            {
                "id": i.id,
                "product_id": i.product_id,
                "title": i.product.title if i.product else "Item",
                "price": i.product.price if i.product else 0,
                "unit": i.product.unit if i.product else "",
                "quantity": i.quantity,
                "subtotal": i.quantity * (i.product.price if i.product else 0),
                "image_url": i.product.image_url if i.product else ""
            }
            for i in items
        ],
        "total_amount": round(total, 2)
    }

@router.delete("/cart/{id}")
def remove_from_cart(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == id, CartItem.user_id == current_user.id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "success", "message": "Item removed from cart"}

# Order Endpoints
@router.post("/orders")
def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Places a demo agricultural marketplace order with choice of:
    - 🚚 Farm Direct Delivery
    - 🏪 Local Agri Center Pickup
    """
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        # If cart is empty during a demo, create a sample order with 1 product
        sample_prod = db.query(Product).first()
        total_amt = sample_prod.price if sample_prod else 280.0
        items_to_order = [(sample_prod, 1)] if sample_prod else []
    else:
        total_amt = sum(i.quantity * i.product.price for i in cart_items if i.product)
        items_to_order = [(i.product, i.quantity) for i in cart_items if i.product]

    order_no = f"AGRO-{random.randint(100000, 999999)}"
    order = Order(
        user_id=current_user.id,
        order_number=order_no,
        total_amount=round(total_amt, 2),
        delivery_type=data.delivery_type,
        status="confirmed",
        shipping_address=data.shipping_address or "Ramesh Gowda Farm, Srinivaspur, Kolar",
        pickup_location=data.pickup_location or "Kisan Seva Krishi Hub, APMC Yard, Kolar",
        payment_status="DEMO_PAID"
    )
    db.add(order)
    db.flush()

    for prod, qty in items_to_order:
        oi = OrderItem(
            order_id=order.id,
            product_id=prod.id,
            quantity=qty,
            unit_price=prod.price
        )
        db.add(oi)

    # Clear user's cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    # Send order confirmation notification
    notif = Notification(
        user_id=current_user.id,
        title="Agri Marketplace Order Confirmed",
        message=f"Order {order_no} (Rs {total_amt}) placed successfully. Method: {data.delivery_type.capitalize()}.",
        alert_type="order",
        link=f"/farmer/orders"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "order_number": order_no,
        "total_amount": order.total_amount,
        "delivery_type": order.delivery_type,
        "payment_status": "DEMO_PAID (Demonstration Transaction)",
        "message": "Demo order placed successfully with digital invoice."
    }

@router.get("/orders")
def get_user_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [
        {
            "id": o.id,
            "order_number": o.order_number,
            "total_amount": o.total_amount,
            "delivery_type": o.delivery_type,
            "status": o.status,
            "payment_status": o.payment_status,
            "created_at": o.created_at.strftime("%Y-%m-%d %H:%M"),
            "items": [
                {
                    "title": item.product.title if item.product else "Agri Supply",
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "subtotal": item.quantity * item.unit_price
                }
                for item in o.items
            ]
        }
        for o in orders
    ]
