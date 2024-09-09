'use client';

import React, { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

function mergeIdentity(xdm: any, email: string) {
  if (!!email && email.length > 0) {
    return {
      ...xdm,
      identityMap: {
        Email: [{ id: email, primary: true }],
      },
    };
  }
  return xdm;
}

function sendToast(toast: any, title: string, description: string) {
  toast({ title, description });
}

export default function Page() {
  const { toast } = useToast();

  async function viewProductClickHandler(email: string) {
    const xdm = mergeIdentity(
      {
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
      email
    );
    console.log('>>>>> xdm:', JSON.stringify(xdm, undefined, 2));

    // @ts-ignore
    await alloy('sendEvent', { xdm });

    track('View Product');
    sendToast(toast, 'View Product', 'View product event has been sent');
  }

  async function addToCartClickHandler(email: string) {
    const xdm = mergeIdentity(
      {
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
      email
    );
    console.log('>>>>> xdm:', JSON.stringify(xdm, undefined, 2));

    // @ts-ignore
    await alloy('sendEvent', { xdm });

    track('Add to Cart');
    sendToast(toast, 'Add to Cart', 'Add to cart event has been sent');
  }

  async function checkoutClickHandler(email: string) {
    const xdm = mergeIdentity(
      {
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
      email
    );
    console.log('>>>>> xdm:', JSON.stringify(xdm, undefined, 2));

    // @ts-ignore
    await alloy('sendEvent', { xdm });

    track('Checkout');
    sendToast(toast, 'Checkout', 'Checkout event has been sent');
  }

  const [email, setEmail] = useState('');
  const [ecid, setEcid] = useState('');

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="m-4">ECID: {ecid}</div>
        <div className="m-4">
          <Button onClick={() => viewProductClickHandler(email)}>
            View Product
          </Button>
        </div>
        <div className="m-4">
          <Button onClick={() => addToCartClickHandler(email)}>
            Add to Cart
          </Button>
        </div>
        <div className="m-4">
          <Button onClick={() => checkoutClickHandler(email)}>Checkout</Button>
        </div>
      </div>
    </main>
  );
}