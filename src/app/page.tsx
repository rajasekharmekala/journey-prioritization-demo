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
    id: 'bf-006',
    title: 'Plain Notebook',
    brand: 'PaperCo',
    originalPrice: 4.99,
    discountedPrice: 4.49,
    discountPercentage: 10,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Office Supplies',
    tags: ['Stationery', 'Basic'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?q=80&w=2573&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Just a regular spiral notebook with lined paper. 70 pages of basic paper.',
    highlights: ['Save 50 cents', 'Lined paper', 'Metal spiral binding'],
    stockStatus: {
      available: true,
    },
  },
  {
    id: 'bf-004',
    title: 'Basic Calculator',
    brand: 'OfficeBasics',
    originalPrice: 9.99,
    discountedPrice: 8.99,
    discountPercentage: 10,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Office Supplies',
    tags: ['Calculator', 'Basic'],
    thumbnailUrl:
      'https://media.istockphoto.com/id/1781688768/photo/2024-on-the-calculator-screen-new-year-2024-on-the-calculator-display-with-copy-space.jpg?s=2048x2048&w=is&k=20&c=iOaU4tqlnVmnQInMSfJwlHUr2TN67Zq83a2xJOdQUTw=',
    description:
      'A simple solar-powered calculator for basic arithmetic. Features large buttons and an LCD display.',
    highlights: ['Save $1', 'Solar Powered', 'Basic Math Functions'],
    stockStatus: {
      available: true,
    },
  },
  {
    id: 'bf-005',
    title: 'Generic USB Cable',
    brand: 'CableCore',
    originalPrice: 7.99,
    discountedPrice: 6.99,
    discountPercentage: 12,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Electronics',
    tags: ['Cable', 'USB'],
    thumbnailUrl:
      'https://media.istockphoto.com/id/114242778/photo/beige-usb-extender-cable-coiled-up.jpg?s=2048x2048&w=is&k=20&c=1zGNnWS0Kb6UbbNCSxTLdC3MRjE2x-8nUbPmkpbaPvw=',
    description:
      "Standard USB-A to USB-C cable. Nothing special about it. It's just a cable.",
    highlights: ['Save $1', '3-foot length', 'Basic data transfer'],
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
  const [isPersonalized, setIsPersonalized] = useState(false);

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
      'Building Your Personalized Black Friday Eve Experience',
      'We are customizing personalized Black Friday Eve offers based on your preferences. Please check back in a moment...',
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
      sendToast(
        toast,
        'Fetching Your Personalized Black Friday Eve Offers',
        'We are curating Black Friday Eve deals based on your preferences. Please wait a moment...'
      );
      // @ts-ignore
      let res = await alloy('sendEvent', payload);
      res = {
        destinations: [],
        inferences: [],
        propositions: [
          {
            id: '4bda866d-25bb-4508-a600-77f99b6d1219',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: '78311725-ae28-45c2-9d21-87db99f50319-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJlZTVjYTdkOC1kMzQ0LTQ4ODAtYjM5Yi1iMTRiZjJiYmVkZDAiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6Ijc4MzExNzI1LWFlMjgtNDVjMi05ZDIxLTg3ZGI5OWY1MDMxOSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiam91cm5leVZlcnNpb25JRCI6ImQ2NWJiNzBjLTNjNmQtNGQxYy05NTQ2LWVmYWMwNjNmOGI2MiIsImpvdXJuZXlBY3Rpb25JRCI6IjZkN2M4ODMwLTUzZTYtNDkwMi1hZWZhLTAwODI5YzMxNDcwZSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiZTFmN2JhMDMtNDNkNy00MzZkLThkMjYtMjY0NjcyNDFiMWNjIiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvY29kZSIsIl90eXBlIjoiaHR0cHM6Ly9ucy5hZG9iZS5jb20veGRtL2NoYW5uZWwtdHlwZXMvY29kZSJ9LCJpc1Rlc3RFeGVjdXRpb24iOmZhbHNlfX0=',
              },
              rank: 1,
              activity: {
                id: 'd65bb70c-3c6d-4d1c-9546-efac063f8b62_6d7c8830-53e6-4902-aefa-00829c31470e#2fa0383b-8b53-41db-863b-5851130940de',
                priority: 10,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                id: '9d7d2038-37f9-4bd3-a16e-8d4b7abe7033',
                schema:
                  'https://ns.adobe.com/personalization/json-content-item',
                data: {
                  content: {
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
                      'https://d1ncau8tqf99kp.cloudfront.net/converted/74739_original_local_1200x1050_v3_converted.webp',
                    description:
                      'Experience premium sound quality with our top-rated noise-cancelling headphones. Features include 30-hour battery life, premium leather cushions, and advanced Bluetooth 5.0 connectivity.',
                    highlights: [
                      '50% Off - Biggest Discount of the Year',
                      'Free Premium Carrying Case',
                      '2-Year Extended Warranty Included',
                    ],
                    stockStatus: { available: true },
                  },
                },
              },
            ],
            renderAttempted: false,
          },
        ],
        decisions: [
          {
            id: '4bda866d-25bb-4508-a600-77f99b6d1219',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: '78311725-ae28-45c2-9d21-87db99f50319-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJlZTVjYTdkOC1kMzQ0LTQ4ODAtYjM5Yi1iMTRiZjJiYmVkZDAiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6Ijc4MzExNzI1LWFlMjgtNDVjMi05ZDIxLTg3ZGI5OWY1MDMxOSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiam91cm5leVZlcnNpb25JRCI6ImQ2NWJiNzBjLTNjNmQtNGQxYy05NTQ2LWVmYWMwNjNmOGI2MiIsImpvdXJuZXlBY3Rpb25JRCI6IjZkN2M4ODMwLTUzZTYtNDkwMi1hZWZhLTAwODI5YzMxNDcwZSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiZTFmN2JhMDMtNDNkNy00MzZkLThkMjYtMjY0NjcyNDFiMWNjIiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvY29kZSIsIl90eXBlIjoiaHR0cHM6Ly9ucy5hZG9iZS5jb20veGRtL2NoYW5uZWwtdHlwZXMvY29kZSJ9LCJpc1Rlc3RFeGVjdXRpb24iOmZhbHNlfX0=',
              },
              rank: 1,
              activity: {
                id: 'd65bb70c-3c6d-4d1c-9546-efac063f8b62_6d7c8830-53e6-4902-aefa-00829c31470e#2fa0383b-8b53-41db-863b-5851130940de',
                priority: 10,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                id: '9d7d2038-37f9-4bd3-a16e-8d4b7abe7033',
                schema:
                  'https://ns.adobe.com/personalization/json-content-item',
                data: {
                  content: {
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
                      'https://d1ncau8tqf99kp.cloudfront.net/converted/74739_original_local_1200x1050_v3_converted.webp',
                    description:
                      'Experience premium sound quality with our top-rated noise-cancelling headphones. Features include 30-hour battery life, premium leather cushions, and advanced Bluetooth 5.0 connectivity.',
                    highlights: [
                      '50% Off - Biggest Discount of the Year',
                      'Free Premium Carrying Case',
                      '2-Year Extended Warranty Included',
                    ],
                    stockStatus: { available: true },
                  },
                },
              },
            ],
          },
        ],
      };

      setResponse(JSON.stringify(res, undefined, 4));

      // Extract offers from personalization decisions
      const personalizationDecisions = res.decisions || [];
      const offerItems = personalizationDecisions
        .map((decision: any) => decision.items)
        .flat()
        .map((i: any) => i?.data?.content);

      if (offerItems.length === 0) {
        setOffers(OFFERS);
        setIsPersonalized(false);
        sendToast(
          toast,
          '',
          'We are still personalizing your Black Friday Eve experience... Meanwhile, here are our featured promotional offers'
        );
        return;
      }

      setOffers(offerItems);
      setIsPersonalized(true);
      sendToast(
        toast,
        'Your Personalized Black Friday Eve Offers',
        'Showing Black Friday Eve deals customized to your preferences and shopping history'
      );
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
            {'Build Personalized Black Friday Eve Offers'}
          </Button>
          <Button
            onClick={personalizationClickHandler}
            disabled={cbeLoading || !cookieState.email?.trim()}
          >
            {'Show My Personalized Black Friday Eve Deals'}
          </Button>
        </div>

        {(isPersonalized || offers.length > 0) && (
          <div
            className={`
            flex items-center justify-center gap-2 p-3 rounded-lg
            ${
              isPersonalized
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            }
          `}
          >
            <div className="text-sm font-medium">
              {isPersonalized
                ? '✨ Personalized Black Friday Eve deals tailored to your preferences'
                : '📢 Preview our Black Friday Eve special offers'}
            </div>
          </div>
        )}
        <OfferCarousel offers={offers} />
      </div>
    </main>
  );
}
