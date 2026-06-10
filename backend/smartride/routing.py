"""WebSocket URL routing for SmartRide."""
from django.urls import re_path
from rides.consumers import RideConsumer, LocationConsumer
from notifications.consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'ws/rides/(?P<ride_id>[0-9a-f-]+)/$', RideConsumer.as_asgi()),
    re_path(r'ws/location/(?P<driver_id>[0-9a-f-]+)/$', LocationConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>[0-9a-f-]+)/$', NotificationConsumer.as_asgi()),
]
