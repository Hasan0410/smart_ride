"""Payments Admin Configuration."""
from django.contrib import admin
from .models import Payment, Wallet, Transaction


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'ride', 'amount', 'method', 'status', 'created_at']
    list_filter = ['method', 'status']
    search_fields = ['user__email', 'transaction_ref']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'updated_at']
    search_fields = ['user__email']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'amount', 'type', 'description', 'created_at']
    list_filter = ['type']
