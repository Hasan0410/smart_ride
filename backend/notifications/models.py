"""Notifications Models."""
import uuid
from django.db import models
from accounts.models import User


class Notification(models.Model):
    """In-app notification for users."""

    class Type(models.TextChoices):
        RIDE_UPDATE = 'ride_update', 'Ride Update'
        PAYMENT = 'payment', 'Payment'
        PROMO = 'promo', 'Promotion'
        SYSTEM = 'system', 'System'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=15, choices=Type.choices, default=Type.SYSTEM)
    is_read = models.BooleanField(default=False)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f'{self.title} → {self.user.email}'


class Complaint(models.Model):
    """User complaint/support ticket."""

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    ride = models.ForeignKey('rides.Ride', on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    admin_response = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject} — {self.status}'
