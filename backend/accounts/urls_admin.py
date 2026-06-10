"""Admin URL patterns."""
from django.urls import path
from .views import (
    AdminUserListView, AdminUserSuspendView, AdminPendingDriversView,
    AdminVerifyDriverView, AdminStatsView,
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('users/', AdminUserListView.as_view(), name='admin_users'),
    path('users/<uuid:user_id>/suspend/', AdminUserSuspendView.as_view(), name='admin_suspend_user'),
    path('drivers/pending/', AdminPendingDriversView.as_view(), name='admin_pending_drivers'),
    path('drivers/<uuid:driver_id>/verify/', AdminVerifyDriverView.as_view(), name='admin_verify_driver'),
]
