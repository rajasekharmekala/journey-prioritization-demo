'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlloyResponse, XDMPayload } from '@/types/payloads';
import { useCookies } from 'react-cookie';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Offer } from './offer';
import OfferCarousel from './offercarousel';

const viewProductPayload: XDMPayload = {
  xdm: {
    eventType: 'commerce.productViews',
  },
};

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

const OFFERS = [
  // {
  //   id: 'bf-006',
  //   title: 'Plain Notebook',
  //   brand: 'PaperCo',
  //   originalPrice: 4.99,
  //   discountedPrice: 4.49,
  //   discountPercentage: 10,
  //   validUntil: '2024-11-24T23:59:59Z',
  //   category: 'Office Supplies',
  //   tags: ['Stationery', 'Basic'],
  //   thumbnailUrl:
  //     'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?q=80&w=2573&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //   description:
  //     'Just a regular spiral notebook with lined paper. 70 pages of basic paper.',
  //   highlights: ['Save 50 cents', 'Lined paper', 'Metal spiral binding'],
  //   stockStatus: {
  //     available: true,
  //   },
  // },
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
    id: 'bf-002',
    title: '4K Smart TV 65-inch',
    brand: 'VisionTech',
    originalPrice: 999.99,
    discountedPrice: 649.99,
    discountPercentage: 35,
    validUntil: '2024-11-24T23:59:59Z',
    category: 'Electronics',
    tags: ['TV', 'Smart Home', '4K', 'Featured'],
    thumbnailUrl:
      'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Immerse yourself in stunning 4K resolution with this 65-inch smart TV. Features HDR, built-in streaming apps, and voice control compatibility.',
    highlights: ['HDR', 'Built-in Streaming Apps', 'Voice Control'],
    stockStatus: {
      available: true,
    },
    blackFridayDeal: true,
  },
];

export default function Page() {
  const [cookieState, setCookieState] = useState<{ email?: string }>({});
  const [cookies, setCookies, removeCookies] = useCookies(['email'], {
    doNotParse: true,
  });
  const { toast } = useToast();
  const [response, setResponse] = useState('');
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [cbeLoading, setCbeLoading] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const defaultIndex = useRef(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        defaultIndex.current = 0;
        console.log('>>>>> Setting defaultIndex to:', 0);
      }
      if (e.ctrlKey && e.key === 'b') {
        defaultIndex.current = 1;
        console.log('>>>>> Setting defaultIndex to:', 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    // return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
    setCurrentSlide(0);

    try {
      sendToast(
        toast,
        'Fetching Your Personalized Black Friday Eve Offers',
        'We are curating Black Friday Eve deals based on your preferences. Please wait a moment...'
      );
      // @ts-ignore
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

      // Extract offers from personalization decisions
      const personalizationDecisions = res.decisions || [];
      personalizationDecisions.sort(
        (a: any, b: any) =>
          (a.scopeDetails?.rank || 0) - (b.scopeDetails?.rank || 0)
      );
      const offerItems = personalizationDecisions
        .map((decision: any) => decision.items)
        .flat()
        .map((item: any) => {
          // Extract meta from either direct meta property or from rules consequences
          const meta =
            item?.data?.meta ||
            item?.data?.rules?.[0]?.consequences?.[0]?.detail?.data?.meta;

          if (!meta || !meta.title) return null;

          return {
            id: meta.id,
            title: meta.title,
            brand: meta.brand,
            originalPrice: Number(meta.originalPrice),
            discountedPrice: Number(meta.discountedPrice),
            discountPercentage: Number(meta.discountPercentage),
            validUntil: meta.validUntil,
            category: meta.category,
            tags: meta.tags.split(','),
            thumbnailUrl: meta.thumbnailUrl,
            description: meta.description,
            highlights: meta.highlights.split(','),
            available: meta.available === 'true',
            blackFridayDeal: meta.blackFridayDeal === 'true',
          };
        })
        .filter(Boolean); // Remove any null entries

      // if (offerItems.length === 0) {
      //   setOffers([]);
      //   setIsPersonalized(false);
      //   setCurrentSlide(0);
      //   sendToast(
      //     toast,
      //     '',
      //     'We are still personalizing your Black Friday Eve experience... Meanwhile, here are our featured promotional offers'
      //   );
      //   return;
      // }

      setOffers([OFFERS[defaultIndex.current]]);
      setIsPersonalized(true);
      setCurrentSlide(0);
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
            onConfirm={async () => {
              await Promise.all([
                viewProductClickHandler(),
                personalizationClickHandler(),
              ]);
            }}
            className="flex-1"
          />
          {cookieState.email && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  removeCookies('email');
                  setCookieState({});
                }}
              >
                Clear
              </Button>
              {/* <Button
                onClick={async () => {
                  await Promise.all([
                    viewProductClickHandler(),
                    personalizationClickHandler(),
                  ]);
                }}
                disabled={viewProductLoading || !cookieState.email?.trim()}
              >
                {'Register'}
              </Button> */}
              <Button
                onClick={personalizationClickHandler}
                disabled={cbeLoading || !cookieState.email?.trim()}
              >
                {'Show my personalized deals'}
              </Button>
            </>
          )}
        </div>

        {/* <div className="flex gap-4"> */}
        {/* <Button
            onClick={personalizationClickHandler}
            disabled={cbeLoading || !cookieState.email?.trim()}
          >
            {'Show my personalized deals'}
          </Button> */}
        {/* </div> */}
        <OfferCarousel
          offers={offers}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
      </div>
    </main>
  );
}
