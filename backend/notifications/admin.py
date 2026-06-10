"""Notifications Admin."""
from django.contrib import admin
from .models import Notification, Complaint

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'type', 'is_read', 'created_at']
    list_filter = ['type', 'is_read']

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'status', 'created_at', 'resolved_at']
    list_filter = ['status']
    search_fields = ['subject', 'user__email']
