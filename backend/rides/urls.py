"""Rides URL patterns."""
from django.urls import path
from .views import (
    FareEstimateView, CreateRideView, CancelRideView, AcceptRideView,
    StartRideView, CompleteRideView, RideDetailView, RideHistoryView,
    ActiveRidesView,
)

urlpatterns = [
    path('estimate/', FareEstimateView.as_view(), name='fare_estimate'),
    path('create/', CreateRideView.as_view(), name='create_ride'),
    path('<uuid:ride_id>/', RideDetailView.as_view(), name='ride_detail'),
    path('<uuid:ride_id>/cancel/', CancelRideView.as_view(), name='cancel_ride'),
    path('<uuid:ride_id>/accept/', AcceptRideView.as_view(), name='accept_ride'),
    path('<uuid:ride_id>/start/', StartRideView.as_view(), name='start_ride'),
    path('<uuid:ride_id>/complete/', CompleteRideView.as_view(), name='complete_ride'),
    path('history/', RideHistoryView.as_view(), name='ride_history'),
    path('active/', ActiveRidesView.as_view(), name='active_rides'),
]
