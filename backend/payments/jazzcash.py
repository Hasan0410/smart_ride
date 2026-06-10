"""JazzCash Payment Gateway Integration."""
import hmac
import hashlib
import datetime
import uuid
from django.conf import settings


def generate_jazzcash_hash(data_dict):
    """Generate HMAC-SHA256 hash for JazzCash transaction integrity."""
    salt = settings.JAZZCASH_INTEGRITY_SALT
    # Sort values alphabetically by key
    sorted_keys = sorted(data_dict.keys())
    data_string = '&'.join([str(data_dict[k]) for k in sorted_keys if data_dict[k]])
    hash_string = f'{salt}&{data_string}'

    return hmac.new(
        salt.encode('utf-8'),
        hash_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()


def prepare_jazzcash_payment(amount, order_id, description='Ride Payment'):
    """
    Prepare JazzCash payment request data.
    Returns a dict with all required fields for the JazzCash API.
    """
    now = datetime.datetime.now()
    txn_ref = f'T{now.strftime("%Y%m%d%H%M%S")}{str(uuid.uuid4())[:8]}'
    expiry = (now + datetime.timedelta(hours=1)).strftime('%Y%m%d%H%M%S')

    data = {
        'pp_Version': '1.1',
        'pp_TxnType': 'MWALLET',
        'pp_Language': 'EN',
        'pp_MerchantID': settings.JAZZCASH_MERCHANT_ID,
        'pp_Password': settings.JAZZCASH_PASSWORD,
        'pp_TxnRefNo': txn_ref,
        'pp_Amount': str(int(amount * 100)),  # Amount in paisa
        'pp_TxnCurrency': 'PKR',
        'pp_TxnDateTime': now.strftime('%Y%m%d%H%M%S'),
        'pp_BillReference': str(order_id),
        'pp_Description': description,
        'pp_TxnExpiryDateTime': expiry,
        'pp_ReturnURL': settings.JAZZCASH_RETURN_URL,
    }

    data['pp_SecureHash'] = generate_jazzcash_hash(data)

    api_url = (
        settings.JAZZCASH_SANDBOX_URL
        if settings.JAZZCASH_SANDBOX
        else settings.JAZZCASH_LIVE_URL
    )

    return {
        'api_url': api_url,
        'data': data,
        'txn_ref': txn_ref,
    }


def verify_jazzcash_callback(callback_data):
    """Verify the integrity of JazzCash callback data."""
    received_hash = callback_data.pop('pp_SecureHash', '')
    computed_hash = generate_jazzcash_hash(callback_data)
    return received_hash == computed_hash


def simulate_jazzcash_payment(amount, order_id):
    """
    Simulate JazzCash payment for development/testing.
    Returns a simulated successful response.
    """
    txn_ref = f'SIM-{str(uuid.uuid4())[:12]}'
    return {
        'success': True,
        'txn_ref': txn_ref,
        'amount': float(amount),
        'order_id': str(order_id),
        'status': 'completed',
        'message': 'Payment simulated successfully (sandbox mode)',
        'response_code': '000',
    }
