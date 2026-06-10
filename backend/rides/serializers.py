"""Rides Serializers."""
from rest_framework import serializers
from .models import Ride
from accounts.serializers import UserSerializer, DriverProfileSerializer


class RideCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new ride."""

    class Meta:
        model = Ride
        fields = ['pickup_lat', 'pickup_lng', 'pickup_address',
                  'dropoff_lat', 'dropoff_lng', 'dropoff_address',
                  'vehicle_type', 'payment_method']


class RideSerializer(serializers.ModelSerializer):
    """Full ride serializer with related data."""
    passenger_name = serializers.CharField(source='passenger.full_name', read_only=True)
    passenger_phone = serializers.CharField(source='passenger.phone', read_only=True)
    passenger_avatar = serializers.FileField(source='passenger.avatar', read_only=True)
    driver_info = DriverProfileSerializer(source='driver', read_only=True)

    class Meta:
        model = Ride
        fields = '__all__'
        read_only_fields = ['id', 'passenger', 'fare_amount', 'distance_km',
                            'duration_minutes', 'requested_at']


class RideHistorySerializer(serializers.ModelSerializer):
    """Lightweight serializer for ride history lists."""
    passenger_name = serializers.CharField(source='passenger.full_name', read_only=True)

    class Meta:
        model = Ride
        fields = ['id', 'pickup_address', 'dropoff_address', 'fare_amount',
                  'distance_km', 'duration_minutes', 'status', 'vehicle_type',
                  'payment_method', 'requested_at', 'completed_at', 'passenger_name']


class FareEstimateSerializer(serializers.Serializer):
    """Serializer for fare estimation request."""
    pickup_lat = serializers.FloatField()
    pickup_lng = serializers.FloatField()
    dropoff_lat = serializers.FloatField()
    dropoff_lng = serializers.FloatField()
    vehicle_type = serializers.ChoiceField(
        choices=Ride.VehicleType.choices,
        default='economy'
    )
