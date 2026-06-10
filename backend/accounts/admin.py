"""Accounts Admin Configuration."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DriverProfile, Vehicle


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified', 'created_at']
    list_filter = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'status', 'is_online', 'rating_avg', 'total_rides']
    list_filter = ['status', 'is_online']
    search_fields = ['user__email', 'license_number']


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['driver', 'make', 'model', 'plate_number', 'vehicle_type', 'is_active']
    list_filter = ['vehicle_type', 'is_active']
    search_fields = ['plate_number', 'make', 'model']
