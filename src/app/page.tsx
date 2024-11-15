'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlloyResponse, XDMPayload } from '@/types/payloads';
import { useCookies } from 'react-cookie';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

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
        return;
      }

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

        {response && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="font-semibold mb-2">Response:</div>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96">
              {response}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
