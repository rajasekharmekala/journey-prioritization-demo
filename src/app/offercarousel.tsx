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

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Offer, OfferCard } from './offer';

interface OfferCarouselProps {
  offers: Offer[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}

export function OfferCarousel({
  offers,
  currentSlide: currentIndex,
  setCurrentSlide: setCurrentIndex,
}: OfferCarouselProps) {
  // const [currentIndex, setCurrentIndex] = useState(currentSlide);

  if (!offers || offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-gray-50">
        <p className="text-xl font-medium text-gray-600 mb-2">
          No Offers Available
        </p>
        <p className="text-gray-500">
          Request your personalized Black Friday Eve offers and come back!
        </p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(currentIndex - 1);
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
