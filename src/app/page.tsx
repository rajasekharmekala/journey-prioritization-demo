'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlloyResponse, XDMPayload } from '@/types/payloads';
import { useCookies } from 'react-cookie';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import OfferCarousel from './offercarousel';

const viewProductPayload: XDMPayload = {
  xdm: {
    eventType: 'commerce.productViews',
    commerce: {
      productViews: {
        value: 1,
      },
    },
    productListItems: [
      {
        SKU: 'A111',
        name: 'Shampoo',
        quantity: 1,
      },
    ],
  },
};

const OFFERS = [
  {
    id: 'bf-001',
    title: 'Premium Noise-Cancelling Headphones',
    brand: 'SoundMax',
    originalPrice: 299.99,
    discountedPrice: 149.99,
    discountPercentage: 50,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Electronics',
    tags: ['Headphones', 'Audio', 'Wireless', 'Featured'],
    thumbnailUrl:
      'https://plus.unsplash.com/premium_photo-1678099940967-73fe30680949?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Experience premium sound quality with our top-rated noise-cancelling headphones. Features include 30-hour battery life, premium leather cushions, and advanced Bluetooth 5.0 connectivity.',
    highlights: [
      '50% Off - Biggest Discount of the Year',
      'Free Premium Carrying Case',
      '2-Year Extended Warranty Included',
    ],
    stockStatus: {
      available: true,
    },
  },
  {
    id: 'bf-002',
    title: '4K Smart TV 65-inch',
    brand: 'VisionTech',
    originalPrice: 999.99,
    discountedPrice: 649.99,
    discountPercentage: 35,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Electronics',
    tags: ['TV', 'Smart Home', '4K', 'Featured'],
    thumbnailUrl: 'https://example.com/images/tv-deal.jpg',
    description:
      'Immerse yourself in stunning 4K resolution with this 65-inch smart TV. Features HDR, built-in streaming apps, and voice control compatibility.',
    highlights: ['Save $350', 'Free Wall Mount Kit', 'Free Installation'],
    stockStatus: {
      available: true,
    },
  },
  {
    id: 'bf-003',
    title: 'Gaming Laptop Pro',
    brand: 'TechPro',
    originalPrice: 1499.99,
    discountedPrice: 999.99,
    discountPercentage: 33,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Computers',
    tags: ['Gaming', 'Laptop', 'RTX 4060', 'Featured'],
    thumbnailUrl: 'https://example.com/images/gaming-laptop-deal.jpg',
    description:
      'Ultimate gaming performance with RTX 4060, 16GB RAM, 1TB SSD, and a 165Hz display. Perfect for both gaming and content creation.',
    highlights: [
      'Save $500',
      'Free Gaming Mouse',
      '3-Year Accidental Damage Protection',
    ],
    stockStatus: {
      available: true,
    },
  },
];

const personalizationPayload: XDMPayload = {
  personalization: {
    surfaces: ['#home', '#foo', '#bar', '#foobar'],
  },
};

function mergePayload(payload: XDMPayload, email: string): XDMPayload {
  if (!!email && email.length > 0) {
    return {
      ...payload,
      xdm: {
        eventType: payload.xdm?.eventType || '',
        ...payload.xdm,
        identityMap: {
          Email: [
            { id: email, primary: true, authenticatedState: 'authenticated' },
          ],
        },
      },
    };
  }
  return payload;
}

function sendToast(toast: any, title: string, description: string) {
  toast({ title, description });
}

export default function Page() {
  const [cookieState, setCookieState] = useState<{ email?: string }>({});
  const [cookies, setCookies, removeCookies] = useCookies(['email'], {
    doNotParse: true,
  });
  const { toast } = useToast();
  const [response, setResponse] = useState('');
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [cbeLoading, setCbeLoading] = useState(false);
  const [offers, setOffers] = useState<any[]>(OFFERS);

  useEffect(() => {
    setCookieState({ email: cookies.email });
  }, [cookies.email]);

  const handleEvent = async (
    payload: XDMPayload,
    toastTitle: string,
    toastMessage: string,
    setLoading: (loading: boolean) => void
  ) => {
    if (!cookieState.email?.trim()) {
      sendToast(toast, 'Error', 'Please enter an email address first');
      return;
    }

    setLoading(true);
    try {
      // @ts-ignore - alloy is globally defined
      const alloyPromise = alloy('sendEvent', payload);
      const res = await Promise.race([
        alloyPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('request timed out after 3 seconds')),
            3000
          )
        ),
      ]);
      setResponse(JSON.stringify(res, undefined, 4));
      sendToast(toast, toastTitle, toastMessage);
      return res;
    } catch (error) {
      sendToast(
        toast,
        'Error',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const viewProductClickHandler = useCallback(async () => {
    if (!cookieState.email?.trim()) {
      sendToast(toast, 'Error', 'Please enter an email address first');
      return;
    }

    const payload = mergePayload(viewProductPayload, cookieState.email);
    console.log('>>>>> payload:', JSON.stringify(payload, undefined, 2));
    await handleEvent(
      payload,
      'View Product',
      'View product event has been sent',
      setViewProductLoading
    );
  }, [toast, cookieState.email, setResponse]);

  const personalizationClickHandler = useCallback(async () => {
    if (!cookieState.email?.trim()) {
      sendToast(toast, 'Error', 'Please enter an email address first');
      return;
    }

    const payload = mergePayload(personalizationPayload, cookieState.email);
    console.log('>>>>> payload:', JSON.stringify(payload, undefined, 2));
    setCbeLoading(true);
    try {
      sendToast(toast, 'Code-based Experience', 'CBE request has been sent');
      // @ts-ignore
      const res = await alloy('sendEvent', payload);
      setResponse(JSON.stringify(res, undefined, 4));
      if (!res.propositions || res.propositions.length === 0) {
        setOffers([]);
        return;
      }

      // Extract offers from personalization decisions
      const personalizationDecisions = res.handle?.find(
        (h: any) => h.type === 'personalization:decisions'
      );
      const offerItems =
        personalizationDecisions?.payload?.flatMap((p: any) => p.items || []) ||
        [];
      setOffers(offerItems);

      // @ts-ignore
      await alloy('sendEvent', {
        xdm: {
          eventType: 'decisioning.propositionDisplay',
          _experience: {
            decisioning: {
              propositionEventType: {
                display: 1,
              },
              propositions: res.propositions.map((p: any) => ({
                id: p.id,
                scope: p.scope,
                scopeDetails: p.scopeDetails,
              })),
            },
          },
        },
      });
    } finally {
      setCbeLoading(false);
    }
  }, [toast, cookieState.email, setResponse]);

  return (
    <main className="min-h-screen flex flex-col max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <Input
            type="email"
            placeholder="Enter an email address to simulate authenticated session"
            value={cookieState.email || ''}
            onChange={(e) => setCookies('email', e.target.value)}
            className="flex-1"
          />
          {cookieState.email && (
            <Button
              variant="outline"
              onClick={() => {
                removeCookies('email');
                setCookieState({});
              }}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={viewProductClickHandler}
            disabled={viewProductLoading || !cookieState.email?.trim()}
          >
            {'View Product'}
          </Button>
          <Button
            onClick={personalizationClickHandler}
            disabled={cbeLoading || !cookieState.email?.trim()}
          >
            {'Show CBE or Content Card'}
          </Button>
        </div>

        <OfferCarousel offers={offers} />
      </div>
    </main>
  );
}
