"""Profile URL patterns."""
from django.urls import path
from .views import ProfileView, ChangePasswordView, AvatarUploadView, DeleteAccountView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    path('profile/delete/', DeleteAccountView.as_view(), name='delete_account'),
]
