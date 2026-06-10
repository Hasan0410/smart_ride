"""Rides Admin Configuration."""
from django.contrib import admin
from .models import Ride


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ['id', 'passenger', 'driver', 'status', 'fare_amount', 'distance_km', 'requested_at']
    list_filter = ['status', 'vehicle_type', 'payment_method']
    search_fields = ['passenger__email', 'pickup_address', 'dropoff_address']
    readonly_fields = ['id', 'requested_at']
    ordering = ['-requested_at']
