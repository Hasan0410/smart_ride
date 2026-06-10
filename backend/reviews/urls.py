"""Reviews URL patterns."""
from django.urls import path
from .views import CreateReviewView, DriverReviewsView, MyReviewsView

urlpatterns = [
    path('create/', CreateReviewView.as_view(), name='create_review'),
    path('driver/<uuid:driver_id>/', DriverReviewsView.as_view(), name='driver_reviews'),
    path('my/', MyReviewsView.as_view(), name='my_reviews'),
]
