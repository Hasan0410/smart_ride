"""Reviews Models — Rating and feedback for rides."""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from rides.models import Ride


class Review(models.Model):
    """Review/rating for a completed ride."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ['ride', 'reviewer']

    def __str__(self):
        return f'{self.reviewer} → {self.reviewee}: {self.rating}★'
