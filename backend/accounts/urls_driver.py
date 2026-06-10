"""Driver URL patterns."""
from django.urls import path
from .views import (
    DriverRegisterView, DriverStatusToggleView, DriverLocationUpdateView,
    DriverEarningsView, DriverProfileDetailView, NearbyDriversView,
)

urlpatterns = [
    path('register/', DriverRegisterView.as_view(), name='driver_register'),
    path('status/', DriverStatusToggleView.as_view(), name='driver_status'),
    path('location/', DriverLocationUpdateView.as_view(), name='driver_location'),
    path('earnings/', DriverEarningsView.as_view(), name='driver_earnings'),
    path('profile/', DriverProfileDetailView.as_view(), name='driver_profile'),
    path('nearby/', NearbyDriversView.as_view(), name='nearby_drivers'),
]
