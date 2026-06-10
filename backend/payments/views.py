"""Payments Views — payment processing, wallet, transactions."""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from decimal import Decimal

from .models import Payment, Wallet, Transaction
from .serializers import PaymentSerializer, WalletSerializer, TransactionSerializer, TopUpSerializer
from .jazzcash import prepare_jazzcash_payment, verify_jazzcash_callback, simulate_jazzcash_payment
from rides.models import Ride
from accounts.permissions import IsAdmin


class InitiatePaymentView(APIView):
    """Initiate payment for a ride."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ride_id = request.data.get('ride_id')
        method = request.data.get('method', 'jazzcash')

        try:
            ride = Ride.objects.get(id=ride_id, passenger=request.user, status='completed')
        except Ride.DoesNotExist:
            return Response({'detail': 'Ride not found or not completed.'}, status=404)

        if hasattr(ride, 'payment') and ride.payment.status == 'completed':
            return Response({'detail': 'Payment already completed.'}, status=400)

        amount = ride.fare_amount

        if method == 'wallet':
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            if wallet.balance < amount:
                return Response({'detail': 'Insufficient wallet balance.'}, status=400)
            wallet.balance -= amount
            wallet.save()
            Transaction.objects.create(
                wallet=wallet, amount=amount, type='debit',
                description=f'Ride payment — {ride.dropoff_address}',
                reference_id=ride.id,
            )
            payment = Payment.objects.create(
                ride=ride, user=request.user, amount=amount,
                method='wallet', status='completed',
                transaction_ref=f'WALLET-{ride.id}',
            )
            return Response(PaymentSerializer(payment).data)

        elif method == 'jazzcash':
            if settings.JAZZCASH_SANDBOX:
                result = simulate_jazzcash_payment(amount, ride.id)
                payment = Payment.objects.create(
                    ride=ride, user=request.user, amount=amount,
                    method='jazzcash', status='completed',
                    transaction_ref=result['txn_ref'],
                    gateway_response=result,
                )
                return Response({
                    'payment': PaymentSerializer(payment).data,
                    'simulated': True,
                    'message': result['message'],
                })
            else:
                jazzcash_data = prepare_jazzcash_payment(float(amount), ride.id)
                Payment.objects.create(
                    ride=ride, user=request.user, amount=amount,
                    method='jazzcash', status='pending',
                    transaction_ref=jazzcash_data['txn_ref'],
                )
                return Response({
                    'redirect_url': jazzcash_data['api_url'],
                    'form_data': jazzcash_data['data'],
                })

        elif method == 'cash':
            payment = Payment.objects.create(
                ride=ride, user=request.user, amount=amount,
                method='cash', status='completed',
                transaction_ref=f'CASH-{ride.id}',
            )
            return Response(PaymentSerializer(payment).data)

        return Response({'detail': 'Invalid payment method.'}, status=400)


class JazzCashCallbackView(APIView):
    """Handle JazzCash payment callback."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        callback_data = request.data.copy()
        if verify_jazzcash_callback(callback_data):
            txn_ref = callback_data.get('pp_TxnRefNo')
            response_code = callback_data.get('pp_ResponseCode')
            try:
                payment = Payment.objects.get(transaction_ref=txn_ref)
                if response_code == '000':
                    payment.status = 'completed'
                else:
                    payment.status = 'failed'
                payment.gateway_response = callback_data
                payment.save()
                return Response({'detail': 'Callback processed.'})
            except Payment.DoesNotExist:
                return Response({'detail': 'Payment not found.'}, status=404)
        return Response({'detail': 'Invalid hash.'}, status=400)


class WalletView(APIView):
    """Get current user's wallet."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        return Response(WalletSerializer(wallet).data)


class WalletTopUpView(APIView):
    """Top up wallet balance."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['amount']

        wallet, _ = Wallet.objects.get_or_create(user=request.user)

        if settings.JAZZCASH_SANDBOX:
            result = simulate_jazzcash_payment(amount, wallet.id)
            wallet.balance += Decimal(str(amount))
            wallet.save()
            Transaction.objects.create(
                wallet=wallet, amount=amount, type='credit',
                description='Wallet top-up via JazzCash (simulated)',
            )
            return Response({
                'wallet': WalletSerializer(wallet).data,
                'simulated': True,
            })

        jazzcash_data = prepare_jazzcash_payment(float(amount), wallet.id, 'Wallet Top-up')
        return Response({
            'redirect_url': jazzcash_data['api_url'],
            'form_data': jazzcash_data['data'],
        })


class TransactionHistoryView(generics.ListAPIView):
    """Get wallet transaction history."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        wallet, _ = Wallet.objects.get_or_create(user=self.request.user)
        return Transaction.objects.filter(wallet=wallet)


class PaymentHistoryView(generics.ListAPIView):
    """Get payment history for current user."""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class RefundView(APIView):
    """Process a refund for a payment."""
    permission_classes = [IsAdmin]

    def post(self, request):
        payment_id = request.data.get('payment_id')
        try:
            payment = Payment.objects.get(id=payment_id, status='completed')
            wallet, _ = Wallet.objects.get_or_create(user=payment.user)
            wallet.balance += payment.amount
            wallet.save()
            Transaction.objects.create(
                wallet=wallet, amount=payment.amount, type='credit',
                description=f'Refund for ride payment',
                reference_id=payment.id,
            )
            payment.status = 'refunded'
            payment.save()
            return Response({'detail': 'Refund processed.', 'payment': PaymentSerializer(payment).data})
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=404)
