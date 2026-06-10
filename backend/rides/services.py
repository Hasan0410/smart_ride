"""Ride business logic — fare calculation, driver matching."""
from decimal import Decimal
from math import radians, cos, sin, sqrt, atan2
from accounts.models import DriverProfile


# Fare rates per vehicle type (PKR)
FARE_RATES = {
    'economy': {'base': 100, 'per_km': 18, 'per_min': 3, 'min_fare': 150},
    'comfort': {'base': 150, 'per_km': 25, 'per_min': 5, 'min_fare': 250},
    'premium': {'base': 250, 'per_km': 40, 'per_min': 8, 'min_fare': 400},
}


def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two GPS coordinates in kilometers."""
    R = 6371  # Earth's radius in km
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def calculate_fare(distance_km, duration_minutes, vehicle_type='economy'):
    """Calculate estimated fare based on distance, duration, and vehicle type."""
    rates = FARE_RATES.get(vehicle_type, FARE_RATES['economy'])
    fare = rates['base'] + (rates['per_km'] * distance_km) + (rates['per_min'] * duration_minutes)
    return max(Decimal(str(round(fare, 2))), Decimal(str(rates['min_fare'])))


def estimate_duration(distance_km, avg_speed_kmh=30):
    """Estimate ride duration in minutes based on average city speed."""
    return max(int((distance_km / avg_speed_kmh) * 60), 5)


def find_nearest_driver(pickup_lat, pickup_lng, vehicle_type=None, radius_km=10):
    """Find the nearest available driver to the pickup location."""
    drivers = DriverProfile.objects.filter(
        is_online=True,
        status='approved',
        current_lat__isnull=False,
        current_lng__isnull=False,
    ).select_related('user', 'vehicle')

    if vehicle_type:
        drivers = drivers.filter(vehicle__vehicle_type=vehicle_type)

    best_driver = None
    min_distance = float('inf')

    for driver in drivers:
        distance = haversine_distance(pickup_lat, pickup_lng, driver.current_lat, driver.current_lng)
        if distance <= radius_km and distance < min_distance:
            min_distance = distance
            best_driver = driver

    return best_driver, round(min_distance, 2) if best_driver else None
