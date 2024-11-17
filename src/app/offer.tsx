import React, { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

export interface Offer {
  id: string;
  title: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  validUntil: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  description: string;
  highlights: string[];
  stockStatus: {
    available: boolean;
  };
  blackFridayDeal: boolean;
}

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="relative h-64 w-full">
        <Image
          src={offer.thumbnailUrl}
          alt={offer.title}
          fill
          className="object-contain"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{offer.title}</h2>
          <span
            className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${
              offer.blackFridayDeal
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            }
          `}
          >
            {offer.blackFridayDeal ? '✨ Black Friday' : 'Promotional'}
          </span>
        </div>
        <p className="text-gray-600">{offer.brand}</p>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">${offer.discountedPrice}</span>
          <span className="text-gray-500 line-through">
            ${offer.originalPrice}
          </span>
          <span className="text-green-600 font-semibold">
            {offer.discountPercentage}% OFF
          </span>
        </div>

        <p className="text-gray-700">{offer.description}</p>

        <div className="space-y-1">
          <p className="font-semibold">Highlights:</p>
          <ul className="list-disc list-inside">
            {offer.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          {offer.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
