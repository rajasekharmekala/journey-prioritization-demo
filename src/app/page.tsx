'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

export default function Page() {
  const [cookieState, setCookieState] = useState<{ email?: string }>({});
  const [cookies, setCookies, removeCookies] = useCookies(['email'], {
    doNotParse: true,
  });
  const { toast } = useToast();
  const [response, setResponse] = useState('');
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [cbeLoading, setCbeLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
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
      const res = await alloy('sendEvent', payload);

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

      if (offerItems.length === 0) {
        setOffers([]);
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
        <OfferCarousel offers={offers} />
      </div>
    </main>
  );
}
