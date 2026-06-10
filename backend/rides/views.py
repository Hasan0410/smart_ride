"""Rides Views — CRUD, lifecycle actions, fare estimation."""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Ride
from .serializers import (
    RideCreateSerializer, RideSerializer,
    RideHistorySerializer, FareEstimateSerializer,
)
from .services import calculate_fare, haversine_distance, estimate_duration, find_nearest_driver
from accounts.permissions import IsPassenger, IsDriver, IsApprovedDriver, IsAdmin


class FareEstimateView(APIView):
    """Calculate fare estimate without creating a ride."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FareEstimateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        distance = haversine_distance(
            data['pickup_lat'], data['pickup_lng'],
            data['dropoff_lat'], data['dropoff_lng']
        )
        duration = estimate_duration(distance)

        estimates = {}
        for vtype in ['economy', 'comfort', 'premium']:
            estimates[vtype] = {
                'fare': float(calculate_fare(distance, duration, vtype)),
                'currency': 'PKR',
            }

        return Response({
            'distance_km': round(distance, 2),
            'duration_minutes': duration,
            'estimates': estimates,
            'selected': data.get('vehicle_type', 'economy'),
        })


class CreateRideView(generics.CreateAPIView):
    """Passenger creates a ride request."""
    serializer_class = RideCreateSerializer
    permission_classes = [IsPassenger]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        distance = haversine_distance(
            data['pickup_lat'], data['pickup_lng'],
            data['dropoff_lat'], data['dropoff_lng']
        )
        duration = estimate_duration(distance)
        fare = calculate_fare(distance, duration, data.get('vehicle_type', 'economy'))

        ride = Ride.objects.create(
            passenger=request.user,
            distance_km=round(distance, 2),
            duration_minutes=duration,
            fare_amount=fare,
            **data
        )

        return Response(RideSerializer(ride).data, status=status.HTTP_201_CREATED)


class CancelRideView(APIView):
    """Cancel a ride (by passenger or driver)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ride_id):
        try:
            ride = Ride.objects.get(id=ride_id)
        except Ride.DoesNotExist:
            return Response({'detail': 'Ride not found.'}, status=404)

        if ride.status in ['completed', 'cancelled']:
            return Response({'detail': 'Ride cannot be cancelled.'}, status=400)

        if request.user != ride.passenger and (
            not hasattr(request.user, 'driver_profile') or request.user.driver_profile != ride.driver
        ):
            return Response({'detail': 'Not authorized.'}, status=403)

        ride.status = Ride.Status.CANCELLED
        ride.cancelled_at = timezone.now()
        ride.cancellation_reason = request.data.get('reason', '')
        ride.save()

        return Response(RideSerializer(ride).data)


class AcceptRideView(APIView):
    """Driver accepts a ride request."""
    permission_classes = [IsApprovedDriver]

    def post(self, request, ride_id):
        try:
            ride = Ride.objects.get(id=ride_id, status='requested')
        except Ride.DoesNotExist:
            return Response({'detail': 'Ride not found or already taken.'}, status=404)

        ride.driver = request.user.driver_profile
        ride.status = Ride.Status.ACCEPTED
        ride.accepted_at = timezone.now()
        ride.save()

        return Response(RideSerializer(ride).data)


class StartRideView(APIView):
    """Driver starts the ride (picked up passenger)."""
    permission_classes = [IsApprovedDriver]

    def post(self, request, ride_id):
        try:
            ride = Ride.objects.get(
                id=ride_id,
                driver=request.user.driver_profile,
                status__in=['accepted', 'arriving']
            )
        except Ride.DoesNotExist:
            return Response({'detail': 'Ride not found.'}, status=404)

        ride.status = Ride.Status.IN_PROGRESS
        ride.started_at = timezone.now()
        ride.save()

        return Response(RideSerializer(ride).data)


class CompleteRideView(APIView):
    """Driver completes the ride."""
    permission_classes = [IsApprovedDriver]

    def post(self, request, ride_id):
        try:
            ride = Ride.objects.get(
                id=ride_id,
                driver=request.user.driver_profile,
                status='in_progress'
            )
        except Ride.DoesNotExist:
            return Response({'detail': 'Ride not found.'}, status=404)

        ride.status = Ride.Status.COMPLETED
        ride.completed_at = timezone.now()
        ride.save()

        # Update driver stats
        driver = ride.driver
        driver.total_rides += 1
        driver.total_earnings += ride.fare_amount
        driver.save()

        return Response(RideSerializer(ride).data)


class RideDetailView(generics.RetrieveAPIView):
    """Get ride details."""
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'ride_id'
    queryset = Ride.objects.all()


class RideHistoryView(generics.ListAPIView):
    """Get ride history for current user (passenger or driver)."""
    serializer_class = RideHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'driver' and hasattr(user, 'driver_profile'):
            return Ride.objects.filter(driver=user.driver_profile)
        return Ride.objects.filter(passenger=user)


class ActiveRidesView(generics.ListAPIView):
    """Admin: list all active rides."""
    serializer_class = RideSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Ride.objects.filter(
            status__in=['requested', 'accepted', 'arriving', 'in_progress']
        ).select_related('passenger', 'driver__user')
