"""Notifications URL patterns."""
from django.urls import path
from .views import (
    NotificationListView, MarkNotificationReadView, MarkAllReadView,
    UnreadCountView, CreateComplaintView, MyComplaintsView,
    AdminComplaintsView, AdminUpdateComplaintView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),
    path('<uuid:notification_id>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('read-all/', MarkAllReadView.as_view(), name='mark_all_read'),
    path('unread-count/', UnreadCountView.as_view(), name='unread_count'),
    path('complaints/create/', CreateComplaintView.as_view(), name='create_complaint'),
    path('complaints/my/', MyComplaintsView.as_view(), name='my_complaints'),
    path('complaints/', AdminComplaintsView.as_view(), name='admin_complaints'),
    path('complaints/<uuid:complaint_id>/update/', AdminUpdateComplaintView.as_view(), name='update_complaint'),
]
