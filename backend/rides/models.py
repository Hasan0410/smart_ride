"""Rides Models — Ride with full lifecycle tracking."""
import uuid
from django.db import models
from accounts.models import User, DriverProfile


class Ride(models.Model):
    """Core ride model tracking the entire lifecycle."""

    class Status(models.TextChoices):
        REQUESTED = 'requested', 'Requested'
        ACCEPTED = 'accepted', 'Accepted'
        ARRIVING = 'arriving', 'Driver Arriving'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        JAZZCASH = 'jazzcash', 'JazzCash'
        WALLET = 'wallet', 'Wallet'
        CASH = 'cash', 'Cash'

    class VehicleType(models.TextChoices):
        ECONOMY = 'economy', 'Economy'
        COMFORT = 'comfort', 'Comfort'
        PREMIUM = 'premium', 'Premium'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rides_as_passenger')
    driver = models.ForeignKey(
        DriverProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='rides_as_driver'
    )

    # Location data
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    pickup_address = models.CharField(max_length=500)
    dropoff_lat = models.FloatField()
    dropoff_lng = models.FloatField()
    dropoff_address = models.CharField(max_length=500)

    # Trip details
    distance_km = models.FloatField(default=0)
    duration_minutes = models.IntegerField(default=0)
    fare_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vehicle_type = models.CharField(max_length=10, choices=VehicleType.choices, default=VehicleType.ECONOMY)

    # Status tracking
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.REQUESTED)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH)

    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'rides'
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['passenger', '-requested_at']),
            models.Index(fields=['driver', '-requested_at']),
        ]

    def __str__(self):
        return f'Ride {self.id} — {self.status}'
