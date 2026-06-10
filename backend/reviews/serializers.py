"""Reviews Serializers."""
from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'ride', 'reviewer', 'reviewer_name', 'reviewee',
                  'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at']


class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['ride', 'reviewee', 'rating', 'comment']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
