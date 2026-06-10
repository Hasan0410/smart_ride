"""Notifications Serializers."""
from rest_framework import serializers
from .models import Notification, Complaint


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Complaint
        fields = ['id', 'user', 'user_name', 'ride', 'subject', 'description',
                  'status', 'admin_response', 'created_at', 'resolved_at']
        read_only_fields = ['id', 'user', 'created_at', 'resolved_at']


class CreateComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['ride', 'subject', 'description']
