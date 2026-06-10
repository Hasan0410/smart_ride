"""Reviews Views."""
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Avg

from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from accounts.models import DriverProfile


class CreateReviewView(generics.CreateAPIView):
    """Submit a review for a completed ride."""
    serializer_class = CreateReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)
        # Update driver's average rating if reviewee is a driver
        try:
            driver_profile = review.reviewee.driver_profile
            avg = Review.objects.filter(reviewee=review.reviewee).aggregate(Avg('rating'))
            driver_profile.rating_avg = avg['rating__avg'] or 5.0
            driver_profile.save(update_fields=['rating_avg'])
        except DriverProfile.DoesNotExist:
            pass


class DriverReviewsView(generics.ListAPIView):
    """Get reviews for a specific driver."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        driver_id = self.kwargs['driver_id']
        try:
            driver = DriverProfile.objects.get(id=driver_id)
            return Review.objects.filter(reviewee=driver.user)
        except DriverProfile.DoesNotExist:
            return Review.objects.none()


class MyReviewsView(generics.ListAPIView):
    """Get reviews received by the current user."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(reviewee=self.request.user)
