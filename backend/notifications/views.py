"""Notifications Views."""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Notification, Complaint
from .serializers import NotificationSerializer, ComplaintSerializer, CreateComplaintSerializer
from accounts.permissions import IsAdmin


class NotificationListView(generics.ListAPIView):
    """List current user's notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """Mark a notification as read."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'detail': 'Marked as read.'})
        except Notification.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)


class MarkAllReadView(APIView):
    """Mark all notifications as read."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})


class UnreadCountView(APIView):
    """Get unread notification count."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


# ─── Complaints ──────────────────────────────────────

class CreateComplaintView(generics.CreateAPIView):
    """Submit a complaint."""
    serializer_class = CreateComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyComplaintsView(generics.ListAPIView):
    """List user's complaints."""
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user)


class AdminComplaintsView(generics.ListAPIView):
    """Admin: List all complaints."""
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]
    queryset = Complaint.objects.all()


class AdminUpdateComplaintView(APIView):
    """Admin: Update complaint status and response."""
    permission_classes = [IsAdmin]

    def put(self, request, complaint_id):
        try:
            complaint = Complaint.objects.get(id=complaint_id)
            complaint.status = request.data.get('status', complaint.status)
            complaint.admin_response = request.data.get('admin_response', complaint.admin_response)
            if complaint.status == 'resolved':
                complaint.resolved_at = timezone.now()
            complaint.save()
            return Response(ComplaintSerializer(complaint).data)
        except Complaint.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
