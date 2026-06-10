"""Payments URL patterns."""
from django.urls import path
from .views import (
    InitiatePaymentView, JazzCashCallbackView, WalletView,
    WalletTopUpView, TransactionHistoryView, PaymentHistoryView,
    RefundView,
)

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('callback/', JazzCashCallbackView.as_view(), name='jazzcash_callback'),
    path('history/', PaymentHistoryView.as_view(), name='payment_history'),
    path('refund/', RefundView.as_view(), name='refund'),
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('wallet/topup/', WalletTopUpView.as_view(), name='wallet_topup'),
    path('wallet/transactions/', TransactionHistoryView.as_view(), name='transactions'),
]
