"""WebSocket consumers for real-time ride updates and location tracking."""
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


class RideConsumer(AsyncJsonWebsocketConsumer):
    """Handles real-time ride lifecycle events."""

    async def connect(self):
        self.ride_id = self.scope['url_route']['kwargs']['ride_id']
        self.room_group_name = f'ride_{self.ride_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        event_type = content.get('type', 'ride_update')
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'ride_event',
                'data': content,
            }
        )

    async def ride_event(self, event):
        await self.send_json(event['data'])


class LocationConsumer(AsyncJsonWebsocketConsumer):
    """Handles real-time driver location broadcasting."""

    async def connect(self):
        self.driver_id = self.scope['url_route']['kwargs']['driver_id']
        self.room_group_name = f'driver_location_{self.driver_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        # Driver sends location update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'location_update',
                'data': {
                    'driver_id': self.driver_id,
                    'lat': content.get('lat'),
                    'lng': content.get('lng'),
                    'heading': content.get('heading'),
                    'speed': content.get('speed'),
                    'timestamp': content.get('timestamp'),
                },
            }
        )

    async def location_update(self, event):
        await self.send_json(event['data'])
