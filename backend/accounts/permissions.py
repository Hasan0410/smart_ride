"""Custom permission classes for role-based access control."""
from rest_framework.permissions import BasePermission


class IsPassenger(BasePermission):
    """Allows access only to passenger users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'passenger'


class IsDriver(BasePermission):
    """Allows access only to driver users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'driver'


class IsApprovedDriver(BasePermission):
    """Allows access only to approved driver users."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.role != 'driver':
            return False
        try:
            return request.user.driver_profile.status == 'approved'
        except Exception:
            return False


class IsAdmin(BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(BasePermission):
    """Allows access to object owner or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user
