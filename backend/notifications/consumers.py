"""Notification WebSocket consumer for real-time push notifications."""
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """Handles real-time notification delivery to connected users."""

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'notifications_{self.user_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        # Client can acknowledge notifications
        pass

    async def send_notification(self, event):
        """Send notification to the connected client."""
        await self.send_json(event['data'])
