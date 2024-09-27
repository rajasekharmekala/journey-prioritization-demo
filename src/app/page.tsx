'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { useCookies } from 'react-cookie';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const viewProductPayload = {
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

const addToCartPayload = {
  xdm: {
    eventType: 'commerce.productListAdds',
    commerce: {
      productListAdds: {
        value: 1,
      },
    },
    productListItems: [
      {
        SKU: 'A222',
        name: 'Conditioner',
        quantity: 1,
      },
    ],
  },
};

const checkoutPayload = {
  xdm: {
    eventType: 'commerce.checkouts',
    commerce: {
      checkouts: {
        value: 1,
      },
    },
    productListItems: [
      {
        SKU: 'A333',
        name: 'Shampoo & Conditioner Set',
        quantity: 1,
      },
    ],
  },
};

const personalizationPayload = {
  personalization: {
    surfaces: ['#home', '#foo', '#bar', '#foobar'],
  },
};

function mergePayload(payload: any, email: string) {
  if (!!email && email.length > 0) {
    return {
      ...payload,
      xdm: {
        ...(payload.xdm || {}),
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
  const [cookies, setCookies, removeCookies] = useCookies(['email'], {
    doNotParse: true,
  });
  const { toast } = useToast();
  const [ecid, setEcid] = useState('');
  const [response, setResponse] = useState('');

  const viewProductClickHandler = useCallback(async () => {
    const payload = mergePayload(viewProductPayload, cookies.email);
    console.log('>>>>> payload:', JSON.stringify(payload, undefined, 2));
    // @ts-ignore
    const res = await alloy('sendEvent', payload);
    setResponse(JSON.stringify(res, undefined, 4));
    track('View Product');
    sendToast(toast, 'View Product', 'View product event has been sent');
  }, [toast, cookies.email, setResponse]);

  const addToCartClickHandler = useCallback(async () => {
    setResponse('');
    const payload = mergePayload(addToCartPayload, cookies.email);
    console.log('>>>>> payload:', JSON.stringify(payload, undefined, 2));
    // @ts-ignore
    const res = await alloy('sendEvent', payload);
    setResponse(JSON.stringify(res, undefined, 4));
    track('Add to Cart');
    sendToast(toast, 'Add to Cart', 'Add to cart event has been sent');
  }, [toast, cookies.email, setResponse]);

  const checkoutClickHandler = useCallback(async () => {
    setResponse('');
    const payload = mergePayload(checkoutPayload, cookies.email);
    console.log('>>>>> payload:', JSON.stringify(payload, undefined, 2));
    // @ts-ignore
    const res = await alloy('sendEvent', payload);
    setResponse(JSON.stringify(res, undefined, 4));
    track('Checkout');
    sendToast(toast, 'Checkout', 'Checkout event has been sent');
  }, [toast, cookies.email, setResponse]);

  const personalizationClickHandler = useCallback(async () => {
    const payload = mergePayload(personalizationPayload, cookies.email);
    console.log('>>>>> payload:', JSON.stringify(payload, undefined, 2));
    track('CBE');
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
  }, [toast, cookies.email, setResponse]);

  useEffect(() => {
    // @ts-ignore
    alloy('getIdentity', {
      namespaces: ['ECID'],
    }).then((result: any) => {
      setEcid(result.identity.ECID);
    });
  }, [setEcid]);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="p-4 gap-4">
        <div className="m-4">
          <Input
            type="email"
            placeholder="Enter an email address to simulate authenticated session"
            value={cookies.email || ''}
            onChange={(e) => setCookies('email', e.target.value)}
          />
        </div>
        <div className="m-4">ECID: {ecid}</div>
        <div className="m-4">
          <Button onClick={viewProductClickHandler}>View Product</Button>
        </div>
        <div className="m-4">
          <Button onClick={addToCartClickHandler}>Add to Cart</Button>
        </div>
        <div className="m-4">
          <Button onClick={checkoutClickHandler}>Checkout</Button>
        </div>
        <div className="m-4">
          <Button onClick={personalizationClickHandler}>
            Show CBE or Content Card
          </Button>
        </div>
        <div className="m-4">
          <div>Response:</div>
          <pre>{response}</pre>
        </div>
      </div>
    </main>
  );
}
