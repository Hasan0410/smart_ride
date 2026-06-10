"""Accounts Serializers — Registration, Login, Profile, Driver."""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, DriverProfile, Vehicle


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'phone', 'first_name', 'last_name', 'password', 'password_confirm', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        if attrs.get('role') == User.Role.ADMIN:
            raise serializers.ValidationError({'role': 'Cannot register as admin.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'first_name', 'last_name', 'full_name',
                  'avatar', 'role', 'is_verified', 'created_at']
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'avatar']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for vehicle data."""

    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'color', 'plate_number',
                  'registration_doc', 'vehicle_type', 'is_active']
        read_only_fields = ['id']


class DriverProfileSerializer(serializers.ModelSerializer):
    """Serializer for driver profile."""
    user = UserSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)

    class Meta:
        model = DriverProfile
        fields = ['id', 'user', 'license_number', 'license_image', 'status',
                  'is_online', 'current_lat', 'current_lng', 'rating_avg',
                  'total_rides', 'total_earnings', 'approved_at', 'vehicle']
        read_only_fields = ['id', 'status', 'rating_avg', 'total_rides',
                            'total_earnings', 'approved_at']


class DriverRegistrationSerializer(serializers.Serializer):
    """Serializer for driver registration (adds driver profile to existing user)."""
    license_number = serializers.CharField(max_length=50)
    license_image = serializers.FileField(required=False)
    # Vehicle info
    vehicle_make = serializers.CharField(max_length=50)
    vehicle_model = serializers.CharField(max_length=50)
    vehicle_year = serializers.IntegerField()
    vehicle_color = serializers.CharField(max_length=30)
    plate_number = serializers.CharField(max_length=20)
    registration_doc = serializers.FileField(required=False)
    vehicle_type = serializers.ChoiceField(choices=Vehicle.VehicleType.choices)

    def validate_plate_number(self, value):
        if Vehicle.objects.filter(plate_number=value).exists():
            raise serializers.ValidationError('Vehicle with this plate number already registered.')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        user.role = User.Role.DRIVER
        user.save()

        driver_profile = DriverProfile.objects.create(
            user=user,
            license_number=validated_data['license_number'],
            license_image=validated_data.get('license_image'),
        )

        Vehicle.objects.create(
            driver=driver_profile,
            make=validated_data['vehicle_make'],
            model=validated_data['vehicle_model'],
            year=validated_data['vehicle_year'],
            color=validated_data['vehicle_color'],
            plate_number=validated_data['plate_number'],
            registration_doc=validated_data.get('registration_doc'),
            vehicle_type=validated_data['vehicle_type'],
        )

        return driver_profile


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin-level user serializer with full access."""
    driver_profile = DriverProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'first_name', 'last_name', 'role',
                  'is_active', 'is_verified', 'created_at', 'driver_profile']
        read_only_fields = ['id', 'email', 'created_at']


class NearbyDriverSerializer(serializers.ModelSerializer):
    """Lightweight serializer for nearby driver display."""
    name = serializers.CharField(source='user.full_name')
    avatar = serializers.FileField(source='user.avatar')
    vehicle = VehicleSerializer(read_only=True)

    class Meta:
        model = DriverProfile
        fields = ['id', 'name', 'avatar', 'current_lat', 'current_lng',
                  'rating_avg', 'total_rides', 'vehicle']
