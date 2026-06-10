"""WSGI config for SmartRide."""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartride.settings')
application = get_wsgi_application()
