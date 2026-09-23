import json

import stripe

from app.config import settings
from app.models.bundle import Bundle
from app.models.product import Product
from app.models.user import UserInDB

stripe.api_key = settings.stripe_secret_key


def _create_session(*, name: str, description: str, price: float, user: UserInDB, metadata: dict) -> stripe.checkout.Session:
    return stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        customer_email=user.email,
        allow_promotion_codes=True,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": round(price * 100),
                    "product_data": {
                        "name": name,
                        "description": description[:500],
                    },
                },
                "quantity": 1,
            }
        ],
        metadata=metadata,
        success_url=f"{settings.vault_stripe_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.vault_stripe_cancel_url,
    )


def create_checkout_session_for_product(product: Product, user: UserInDB) -> stripe.checkout.Session:
    return _create_session(
        name=product.title,
        description=product.description,
        price=product.price,
        user=user,
        metadata={"kind": "product", "product_id": str(product.id), "user_id": str(user.id)},
    )


def create_checkout_session_for_bundle(bundle: Bundle, user: UserInDB) -> stripe.checkout.Session:
    return _create_session(
        name=bundle.name,
        description=bundle.description,
        price=bundle.price,
        user=user,
        metadata={"kind": "bundle", "bundle_id": str(bundle.id), "user_id": str(user.id)},
    )


def create_checkout_session_for_cart(cart_items: list[dict], user: UserInDB) -> stripe.checkout.Session:
    """cart_items: [{"type": "product"|"bundle", "id": str, "name": str, "description": str, "price": float}, ...]"""
    line_items = [
        {
            "price_data": {
                "currency": "usd",
                "unit_amount": round(item["price"] * 100),
                "product_data": {
                    "name": item["name"],
                    "description": item["description"][:500],
                },
            },
            "quantity": 1,
        }
        for item in cart_items
    ]
    # Stripe metadata values are capped at 500 chars each - keep only what
    # the webhook needs (type + id) to re-resolve and fulfill each item.
    metadata_items = json.dumps([{"type": item["type"], "id": item["id"]} for item in cart_items])
    return stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        customer_email=user.email,
        allow_promotion_codes=True,
        line_items=line_items,
        metadata={"kind": "cart", "user_id": str(user.id), "items": metadata_items},
        success_url=f"{settings.vault_stripe_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.vault_stripe_cancel_url,
    )
