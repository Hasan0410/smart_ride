"""ASGI config for SmartRide — supports HTTP + WebSocket."""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartride.settings')

django_asgi_app = get_asgi_application()

from smartride.routing import websocket_urlpatterns  # noqa: E402
from smartride.middleware import JWTAuthMiddleware  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
