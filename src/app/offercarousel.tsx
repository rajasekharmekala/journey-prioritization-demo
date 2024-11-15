// {
//     "id": "bf-001",
//     "title": "Premium Noise-Cancelling Headphones",
//     "brand": "SoundMax",
//     "originalPrice": 299.99,
//     "discountedPrice": 149.99,
//     "discountPercentage": 50,
//     "validUntil": "2024-11-24T23:59:59Z",
//     "category": "Electronics",
//     "tags": ["Headphones", "Audio", "Wireless", "Featured"],
//     "thumbnailUrl": "https://d1ncau8tqf99kp.cloudfront.net/converted/74739_original_local_1200x1050_v3_converted.webp",
//     "description": "Experience premium sound quality with our top-rated noise-cancelling headphones. Features include 30-hour battery life, premium leather cushions, and advanced Bluetooth 5.0 connectivity.",
//     "highlights": [
//       "50% Off - Biggest Discount of the Year",
//       "Free Premium Carrying Case",
//       "2-Year Extended Warranty Included"
//     ],
//     "stockStatus": {
//       "available": true
//     }
//   }

import React, { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Offer, OfferCard } from './offer';

interface OfferCarouselProps {
  offers: Offer[];
}

export function OfferCarousel({ offers }: OfferCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!offers || offers.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className="space-y-4">
      <OfferCard offer={offers[currentIndex]} />

      <div className="flex justify-center gap-4">
        <Button onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === offers.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default OfferCarousel;
