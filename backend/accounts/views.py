"""Accounts Views — Auth, Profile, Driver management."""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q, Avg
from django.utils import timezone
from math import radians, cos, sin, sqrt, atan2

from .models import DriverProfile, Vehicle
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, DriverRegistrationSerializer,
    DriverProfileSerializer, NearbyDriverSerializer, AdminUserSerializer,
    VehicleSerializer,
)
from .permissions import IsDriver, IsApprovedDriver, IsAdmin, IsOwnerOrAdmin

User = get_user_model()


# ─── Auth Views ──────────────────────────────────────

from rest_framework.throttling import AnonRateThrottle

class RegisterView(generics.CreateAPIView):
    """Register a new user account."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

class DeleteAccountView(APIView):
    """Soft delete the user account."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.email = f"deleted_{user.id}@smartride.com"
        user.phone = None
        user.first_name = "Deleted"
        user.last_name = "User"
        user.save()
        return Response({'detail': 'Account deleted successfully.'}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Blacklist the refresh token to log out."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


# ─── Profile Views ───────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change the current user's password."""
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated successfully.'})


class AvatarUploadView(APIView):
    """Upload user avatar."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response({'detail': 'No avatar file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        user.avatar = avatar
        user.save()
        return Response(UserSerializer(user).data)


# ─── Driver Views ────────────────────────────────────

class DriverRegisterView(generics.CreateAPIView):
    """Register current user as a driver with vehicle info."""
    serializer_class = DriverRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        driver_profile = serializer.save()
        return Response(
            DriverProfileSerializer(driver_profile).data,
            status=status.HTTP_201_CREATED
        )


class DriverStatusToggleView(APIView):
    """Toggle driver online/offline status."""
    permission_classes = [IsApprovedDriver]

    def put(self, request):
        profile = request.user.driver_profile
        profile.is_online = not profile.is_online
        if profile.is_online:
            profile.current_lat = request.data.get('lat', profile.current_lat)
            profile.current_lng = request.data.get('lng', profile.current_lng)
        profile.save()
        return Response({
            'is_online': profile.is_online,
            'detail': f'You are now {"online" if profile.is_online else "offline"}.'
        })


class DriverLocationUpdateView(APIView):
    """Update driver's current GPS location."""
    permission_classes = [IsApprovedDriver]

    def put(self, request):
        profile = request.user.driver_profile
        profile.current_lat = request.data.get('lat')
        profile.current_lng = request.data.get('lng')
        profile.save(update_fields=['current_lat', 'current_lng'])
        return Response({'detail': 'Location updated.'})


class DriverEarningsView(APIView):
    """Get driver earnings summary."""
    permission_classes = [IsDriver]

    def get(self, request):
        profile = request.user.driver_profile
        from rides.models import Ride
        today = timezone.now().date()

        rides_today = Ride.objects.filter(
            driver=profile, status='completed',
            completed_at__date=today
        )
        rides_week = Ride.objects.filter(
            driver=profile, status='completed',
            completed_at__date__gte=today - timezone.timedelta(days=7)
        )
        rides_month = Ride.objects.filter(
            driver=profile, status='completed',
            completed_at__month=today.month,
            completed_at__year=today.year
        )

        return Response({
            'total_earnings': float(profile.total_earnings),
            'today': {
                'rides': rides_today.count(),
                'earnings': float(sum(r.fare_amount for r in rides_today)),
            },
            'this_week': {
                'rides': rides_week.count(),
                'earnings': float(sum(r.fare_amount for r in rides_week)),
            },
            'this_month': {
                'rides': rides_month.count(),
                'earnings': float(sum(r.fare_amount for r in rides_month)),
            },
        })


class DriverProfileDetailView(generics.RetrieveAPIView):
    """Get driver profile with vehicle info."""
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.driver_profile


def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two GPS points in kilometers."""
    R = 6371
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


class NearbyDriversView(APIView):
    """Get nearby available drivers within radius."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lat = float(request.query_params.get('lat', 0))
        lng = float(request.query_params.get('lng', 0))
        radius_km = float(request.query_params.get('radius', 5))
        vehicle_type = request.query_params.get('vehicle_type')

        drivers = DriverProfile.objects.filter(
            is_online=True,
            status='approved',
            current_lat__isnull=False,
            current_lng__isnull=False,
        ).select_related('user', 'vehicle')

        if vehicle_type:
            drivers = drivers.filter(vehicle__vehicle_type=vehicle_type)

        nearby = []
        for driver in drivers:
            distance = haversine_distance(lat, lng, driver.current_lat, driver.current_lng)
            if distance <= radius_km:
                data = NearbyDriverSerializer(driver).data
                data['distance_km'] = round(distance, 2)
                nearby.append(data)

        nearby.sort(key=lambda x: x['distance_km'])
        return Response(nearby[:20])


# ─── Admin Views ─────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """Admin: List all users with filters."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search))
        return qs


class AdminUserSuspendView(APIView):
    """Admin: Suspend or activate a user."""
    permission_classes = [IsAdmin]

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            action = 'activated' if user.is_active else 'suspended'
            return Response({'detail': f'User {action}.', 'is_active': user.is_active})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminPendingDriversView(generics.ListAPIView):
    """Admin: List drivers pending verification."""
    serializer_class = DriverProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return DriverProfile.objects.filter(status='pending').select_related('user', 'vehicle')


class AdminVerifyDriverView(APIView):
    """Admin: Approve or reject a driver."""
    permission_classes = [IsAdmin]

    def put(self, request, driver_id):
        try:
            driver = DriverProfile.objects.get(id=driver_id)
            action = request.data.get('action')  # 'approve' or 'reject'
            if action == 'approve':
                driver.status = DriverProfile.Status.APPROVED
                driver.approved_at = timezone.now()
                driver.user.is_verified = True
                driver.user.save()
            elif action == 'reject':
                driver.status = DriverProfile.Status.REJECTED
            else:
                return Response({'detail': 'Invalid action. Use "approve" or "reject".'}, status=400)
            driver.save()
            return Response(DriverProfileSerializer(driver).data)
        except DriverProfile.DoesNotExist:
            return Response({'detail': 'Driver not found.'}, status=404)


class AdminStatsView(APIView):
    """Admin: Dashboard statistics."""
    permission_classes = [IsAdmin]

    def get(self, request):
        from rides.models import Ride
        from payments.models import Payment

        total_users = User.objects.filter(role='passenger').count()
        total_drivers = User.objects.filter(role='driver').count()
        active_drivers = DriverProfile.objects.filter(is_online=True).count()
        active_rides = Ride.objects.filter(status__in=['accepted', 'arriving', 'in_progress']).count()
        completed_rides = Ride.objects.filter(status='completed').count()
        total_revenue = Payment.objects.filter(status='completed').aggregate(
            total=models.Sum('amount'))['total'] or 0

        return Response({
            'total_users': total_users,
            'total_drivers': total_drivers,
            'active_drivers': active_drivers,
            'active_rides': active_rides,
            'completed_rides': completed_rides,
            'total_revenue': float(total_revenue),
        })
