import stripe

from app.config import settings
from app.models.course import Course
from app.models.user import UserInDB

stripe.api_key = settings.stripe_secret_key


def create_checkout_session(course: Course, user: UserInDB) -> stripe.checkout.Session:
    return stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        customer_email=user.email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": round(course.price * 100),
                    "product_data": {
                        "name": course.title,
                        "description": course.description[:500],
                    },
                },
                "quantity": 1,
            }
        ],
        metadata={
            "course_id": str(course.id),
            "user_id": str(user.id),
        },
        success_url=f"{settings.stripe_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.stripe_cancel_url,
    )


def construct_webhook_event(payload: bytes, sig_header: str) -> stripe.Event:
    return stripe.Webhook.construct_event(
        payload, sig_header, settings.stripe_webhook_secret
    )
