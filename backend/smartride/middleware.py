from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom WebSocket middleware that extracts the JWT token from the query string
    (e.g., ?token=...) and authenticates the user.
    """
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        
        token = query_params.get('token', [None])[0]
        
        scope['user'] = AnonymousUser()

        if token:
            try:
                # Validate the token
                UntypedToken(token)
                # Decode the token payload to get user id
                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_data.get('user_id')
                if user_id:
                    scope['user'] = await get_user(user_id)
            except (InvalidToken, TokenError, Exception):
                pass
        
        # If user is not authenticated, we could reject the connection
        # but standard Django Channels practice is to assign AnonymousUser
        # and let the consumer decide whether to accept or close the connection.
        
        return await super().__call__(scope, receive, send)
