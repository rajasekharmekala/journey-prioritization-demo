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
            id: 'f1b4982d-8bf0-43d6-956d-1f840085dd1b',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: '5abc0d28-8a02-4e8e-af86-41ecf51dd915-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJmODU0MjU5NS01ZTY0LTQwNTQtOWRiNC01YmQ3OTM4ZTcyMzQiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjVhYmMwZDI4LThhMDItNGU4ZS1hZjg2LTQxZWNmNTFkZDkxNSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6IjdlZGI4N2YzLWRlNmUtNDc2Yy04NzM0LWQ1Y2UxMWM4OGUzZCIsImNhbXBhaWduVmVyc2lvbklEIjoiNzYwYTM1MTYtNGU0MC00YmQyLWI3MDItNmUzYzZkYzQ1NDNmIiwiY2FtcGFpZ25BY3Rpb25JRCI6ImYzMzY2MjExLTIyZjgtNDY3Zi04ZTJlLTkzMjAxZmUzYzA4NSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiMjNlODQxZGEtYTAzMy00YzdiLWEwOWItOGUwYmZlNDk3YmNiIiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvbWVzc2FnZUZlZWQiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL21lc3NhZ2VGZWVkIn19fQ==',
              },
              rank: 2,
              activity: {
                id: '7edb87f3-de6e-476c-8734-d5ce11c88e3d#f3366211-22f8-467f-8e2e-93201fe3c085',
                priority: 0,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                schema:
                  'https://ns.adobe.com/personalization/message/content-card',
                data: {
                  content: {
                    actionUrl: '',
                    body: { content: 'post card' },
                    buttons: [],
                    image: {
                      alt: '',
                      url: 'https://i.ibb.co/0X8R3TG/Messages-24.png',
                    },
                    dismissBtn: { style: 'none' },
                    title: { content: 'Sample card' },
                  },
                  contentType: 'application/json',
                  meta: {
                    adobe: { template: 'SmallImage' },
                    surface:
                      'web://journey-prioritization-demo.vercel.app/#home',
                  },
                  publishedDate: 1731719015,
                  expiryDate: 2019715200,
                  qualifiedDate: 1731719471212,
                },
                id: 'fbd60586-5769-4b29-a6bb-b912ba8a1127',
              },
            ],
          },
          {
            id: '2082d9a5-de7f-43a8-8d44-fc751a06dc84',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: 'c32f7a59-f5ab-47e9-aa70-d55aa0b8688b-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJhNjI2YWU5Ni05YTJkLTQ0OGItYjJmMC1jMDZlMDJjNjExMDYiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6ImMzMmY3YTU5LWY1YWItNDdlOS1hYTcwLWQ1NWFhMGI4Njg4YiIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiam91cm5leVZlcnNpb25JRCI6IjVkMDYxZDFjLWE1ZjMtNGNiZi1iZjJhLWExOGQwMTVmYTM0MiIsImpvdXJuZXlBY3Rpb25JRCI6IjRjN2E2ZTY0LTc3NGMtNGJjZS1hODg2LTQ0Mjg0YTMwMjc4OSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiM2Q1ZmUwNjEtOTBjNy00NzQ4LTkxMjUtYzhkMDdjZjM5Njg2IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvbWVzc2FnZUZlZWQiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL21lc3NhZ2VGZWVkIn0sImlzVGVzdEV4ZWN1dGlvbiI6ZmFsc2V9fQ==',
              },
              rank: 1,
              activity: {
                id: '5d061d1c-a5f3-4cbf-bf2a-a18d015fa342_4c7a6e64-774c-4bce-a886-44284a302789#b0a77dda-be90-4877-b4fa-03c90f20d78f',
                priority: 5,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                schema:
                  'https://ns.adobe.com/personalization/message/content-card',
                data: {
                  content: {
                    actionUrl: '',
                    body: { content: '4K Smart TV 65-inch' },
                    buttons: [],
                    image: {
                      alt: '',
                      url: 'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    },
                    dismissBtn: { style: 'none' },
                    title: { content: 'VisionTech' },
                  },
                  contentType: 'application/json',
                  meta: {
                    title: '4K Smart TV 65-inch',
                    brand: 'VisionTech',
                    originalPrice: '999.99',
                    discountedPrice: '649.99',
                    discountPercentage: '35',
                    validUntil: '2024-11-24T23:59:59Z',
                    category: 'Electronics',
                    tags: 'TV,Smart Home,4K,Featured',
                    thumbnailUrl:
                      'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    description:
                      'Immerse yourself in stunning 4K resolution with this 65-inch smart TV. Features HDR, built-in streaming apps, and voice control compatibility.',
                    highlights:
                      'Save $350,Free Wall Mount Kit,Free Installation',
                    available: 'true',
                    adobe: { template: 'SmallImage' },
                    surface:
                      'web://journey-prioritization-demo.vercel.app/#home',
                  },
                  publishedDate: 1731718328,
                  expiryDate: 2493100800,
                  qualifiedDate: 1731719471212,
                },
                id: '6df624a6-19cd-4edd-a36d-a032d0425e4d',
              },
            ],
          },
          {
            id: 'f1b4982d-8bf0-43d6-956d-1f840085dd1b',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: '5abc0d28-8a02-4e8e-af86-41ecf51dd915-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJmODU0MjU5NS01ZTY0LTQwNTQtOWRiNC01YmQ3OTM4ZTcyMzQiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjVhYmMwZDI4LThhMDItNGU4ZS1hZjg2LTQxZWNmNTFkZDkxNSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6IjdlZGI4N2YzLWRlNmUtNDc2Yy04NzM0LWQ1Y2UxMWM4OGUzZCIsImNhbXBhaWduVmVyc2lvbklEIjoiNzYwYTM1MTYtNGU0MC00YmQyLWI3MDItNmUzYzZkYzQ1NDNmIiwiY2FtcGFpZ25BY3Rpb25JRCI6ImYzMzY2MjExLTIyZjgtNDY3Zi04ZTJlLTkzMjAxZmUzYzA4NSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiMjNlODQxZGEtYTAzMy00YzdiLWEwOWItOGUwYmZlNDk3YmNiIiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvbWVzc2FnZUZlZWQiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL21lc3NhZ2VGZWVkIn19fQ==',
              },
              rank: 2,
              activity: {
                id: '7edb87f3-de6e-476c-8734-d5ce11c88e3d#f3366211-22f8-467f-8e2e-93201fe3c085',
                priority: 0,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                id: 'bbdbccd4-e26a-4212-b084-18d57a61891c',
                schema: 'https://ns.adobe.com/personalization/ruleset-item',
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    'iam.eventType': 'disqualify',
                                    'iam.id':
                                      '7edb87f3-de6e-476c-8734-d5ce11c88e3d#f3366211-22f8-467f-8e2e-93201fe3c085',
                                  },
                                ],
                                matcher: 'eq',
                                value: 0,
                              },
                              type: 'historical',
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: '~timestampu',
                                      matcher: 'lt',
                                      values: [2019715200],
                                    },
                                    type: 'matcher',
                                  },
                                ],
                                logic: 'and',
                              },
                              type: 'group',
                            },
                          ],
                          logic: 'and',
                        },
                        type: 'group',
                      },
                      consequences: [
                        {
                          id: 'fbd60586-5769-4b29-a6bb-b912ba8a1127',
                          type: 'schema',
                          detail: {
                            id: 'fbd60586-5769-4b29-a6bb-b912ba8a1127',
                            schema:
                              'https://ns.adobe.com/personalization/message/content-card',
                            data: {
                              content: {
                                actionUrl: '',
                                body: { content: 'post card' },
                                buttons: [],
                                image: {
                                  alt: '',
                                  url: 'https://i.ibb.co/0X8R3TG/Messages-24.png',
                                },
                                dismissBtn: { style: 'none' },
                                title: { content: 'Sample card' },
                              },
                              contentType: 'application/json',
                              meta: {
                                adobe: { template: 'SmallImage' },
                                surface:
                                  'web://journey-prioritization-demo.vercel.app/#home',
                              },
                              publishedDate: 1731719015,
                              expiryDate: 2019715200,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            renderAttempted: false,
          },
          {
            id: '2082d9a5-de7f-43a8-8d44-fc751a06dc84',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: 'c32f7a59-f5ab-47e9-aa70-d55aa0b8688b-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJhNjI2YWU5Ni05YTJkLTQ0OGItYjJmMC1jMDZlMDJjNjExMDYiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6ImMzMmY3YTU5LWY1YWItNDdlOS1hYTcwLWQ1NWFhMGI4Njg4YiIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiam91cm5leVZlcnNpb25JRCI6IjVkMDYxZDFjLWE1ZjMtNGNiZi1iZjJhLWExOGQwMTVmYTM0MiIsImpvdXJuZXlBY3Rpb25JRCI6IjRjN2E2ZTY0LTc3NGMtNGJjZS1hODg2LTQ0Mjg0YTMwMjc4OSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiM2Q1ZmUwNjEtOTBjNy00NzQ4LTkxMjUtYzhkMDdjZjM5Njg2IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvbWVzc2FnZUZlZWQiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL21lc3NhZ2VGZWVkIn0sImlzVGVzdEV4ZWN1dGlvbiI6ZmFsc2V9fQ==',
              },
              rank: 1,
              activity: {
                id: '5d061d1c-a5f3-4cbf-bf2a-a18d015fa342_4c7a6e64-774c-4bce-a886-44284a302789#b0a77dda-be90-4877-b4fa-03c90f20d78f',
                priority: 5,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                id: '8b762952-b627-49e2-bee3-9c6a12a04aae',
                schema: 'https://ns.adobe.com/personalization/ruleset-item',
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    'iam.eventType': 'disqualify',
                                    'iam.id':
                                      '5d061d1c-a5f3-4cbf-bf2a-a18d015fa342_4c7a6e64-774c-4bce-a886-44284a302789#b0a77dda-be90-4877-b4fa-03c90f20d78f',
                                  },
                                ],
                                matcher: 'eq',
                                value: 0,
                              },
                              type: 'historical',
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: '~timestampu',
                                      matcher: 'lt',
                                      values: [2493100800],
                                    },
                                    type: 'matcher',
                                  },
                                ],
                                logic: 'and',
                              },
                              type: 'group',
                            },
                          ],
                          logic: 'and',
                        },
                        type: 'group',
                      },
                      consequences: [
                        {
                          id: '6df624a6-19cd-4edd-a36d-a032d0425e4d',
                          type: 'schema',
                          detail: {
                            id: '6df624a6-19cd-4edd-a36d-a032d0425e4d',
                            schema:
                              'https://ns.adobe.com/personalization/message/content-card',
                            data: {
                              content: {
                                actionUrl: '',
                                body: { content: '4K Smart TV 65-inch' },
                                buttons: [],
                                image: {
                                  alt: '',
                                  url: 'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                                },
                                dismissBtn: { style: 'none' },
                                title: { content: 'VisionTech' },
                              },
                              contentType: 'application/json',
                              meta: {
                                title: '4K Smart TV 65-inch',
                                brand: 'VisionTech',
                                originalPrice: '999.99',
                                discountedPrice: '649.99',
                                discountPercentage: '35',
                                validUntil: '2024-11-24T23:59:59Z',
                                category: 'Electronics',
                                tags: 'TV,Smart Home,4K,Featured',
                                thumbnailUrl:
                                  'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                                description:
                                  'Immerse yourself in stunning 4K resolution with this 65-inch smart TV. Features HDR, built-in streaming apps, and voice control compatibility.',
                                highlights:
                                  'Save $350,Free Wall Mount Kit,Free Installation',
                                available: 'true',
                                adobe: { template: 'SmallImage' },
                                surface:
                                  'web://journey-prioritization-demo.vercel.app/#home',
                              },
                              publishedDate: 1731718328,
                              expiryDate: 2493100800,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            renderAttempted: false,
          },
        ],
        decisions: [
          {
            id: 'f1b4982d-8bf0-43d6-956d-1f840085dd1b',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: '5abc0d28-8a02-4e8e-af86-41ecf51dd915-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJmODU0MjU5NS01ZTY0LTQwNTQtOWRiNC01YmQ3OTM4ZTcyMzQiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjVhYmMwZDI4LThhMDItNGU4ZS1hZjg2LTQxZWNmNTFkZDkxNSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6IjdlZGI4N2YzLWRlNmUtNDc2Yy04NzM0LWQ1Y2UxMWM4OGUzZCIsImNhbXBhaWduVmVyc2lvbklEIjoiNzYwYTM1MTYtNGU0MC00YmQyLWI3MDItNmUzYzZkYzQ1NDNmIiwiY2FtcGFpZ25BY3Rpb25JRCI6ImYzMzY2MjExLTIyZjgtNDY3Zi04ZTJlLTkzMjAxZmUzYzA4NSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiMjNlODQxZGEtYTAzMy00YzdiLWEwOWItOGUwYmZlNDk3YmNiIiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvbWVzc2FnZUZlZWQiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL21lc3NhZ2VGZWVkIn19fQ==',
              },
              rank: 2,
              activity: {
                id: '7edb87f3-de6e-476c-8734-d5ce11c88e3d#f3366211-22f8-467f-8e2e-93201fe3c085',
                priority: 0,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                id: 'bbdbccd4-e26a-4212-b084-18d57a61891c',
                schema: 'https://ns.adobe.com/personalization/ruleset-item',
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    'iam.eventType': 'disqualify',
                                    'iam.id':
                                      '7edb87f3-de6e-476c-8734-d5ce11c88e3d#f3366211-22f8-467f-8e2e-93201fe3c085',
                                  },
                                ],
                                matcher: 'eq',
                                value: 0,
                              },
                              type: 'historical',
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: '~timestampu',
                                      matcher: 'lt',
                                      values: [2019715200],
                                    },
                                    type: 'matcher',
                                  },
                                ],
                                logic: 'and',
                              },
                              type: 'group',
                            },
                          ],
                          logic: 'and',
                        },
                        type: 'group',
                      },
                      consequences: [
                        {
                          id: 'fbd60586-5769-4b29-a6bb-b912ba8a1127',
                          type: 'schema',
                          detail: {
                            id: 'fbd60586-5769-4b29-a6bb-b912ba8a1127',
                            schema:
                              'https://ns.adobe.com/personalization/message/content-card',
                            data: {
                              content: {
                                actionUrl: '',
                                body: { content: 'post card' },
                                buttons: [],
                                image: {
                                  alt: '',
                                  url: 'https://i.ibb.co/0X8R3TG/Messages-24.png',
                                },
                                dismissBtn: { style: 'none' },
                                title: { content: 'Sample card' },
                              },
                              contentType: 'application/json',
                              meta: {
                                adobe: { template: 'SmallImage' },
                                surface:
                                  'web://journey-prioritization-demo.vercel.app/#home',
                              },
                              publishedDate: 1731719015,
                              expiryDate: 2019715200,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            id: '2082d9a5-de7f-43a8-8d44-fc751a06dc84',
            scope: 'web://journey-prioritization-demo.vercel.app/#home',
            scopeDetails: {
              decisionProvider: 'AJO',
              correlationID: 'c32f7a59-f5ab-47e9-aa70-d55aa0b8688b-0',
              characteristics: {
                eventToken:
                  'eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJhNjI2YWU5Ni05YTJkLTQ0OGItYjJmMC1jMDZlMDJjNjExMDYiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6ImMzMmY3YTU5LWY1YWItNDdlOS1hYTcwLWQ1NWFhMGI4Njg4YiIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiam91cm5leVZlcnNpb25JRCI6IjVkMDYxZDFjLWE1ZjMtNGNiZi1iZjJhLWExOGQwMTVmYTM0MiIsImpvdXJuZXlBY3Rpb25JRCI6IjRjN2E2ZTY0LTc3NGMtNGJjZS1hODg2LTQ0Mjg0YTMwMjc4OSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiM2Q1ZmUwNjEtOTBjNy00NzQ4LTkxMjUtYzhkMDdjZjM5Njg2IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvbWVzc2FnZUZlZWQiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL21lc3NhZ2VGZWVkIn0sImlzVGVzdEV4ZWN1dGlvbiI6ZmFsc2V9fQ==',
              },
              rank: 1,
              activity: {
                id: '5d061d1c-a5f3-4cbf-bf2a-a18d015fa342_4c7a6e64-774c-4bce-a886-44284a302789#b0a77dda-be90-4877-b4fa-03c90f20d78f',
                priority: 5,
                matchedSurfaces: [
                  'web://journey-prioritization-demo.vercel.app/#home',
                ],
              },
            },
            items: [
              {
                id: '8b762952-b627-49e2-bee3-9c6a12a04aae',
                schema: 'https://ns.adobe.com/personalization/ruleset-item',
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    'iam.eventType': 'disqualify',
                                    'iam.id':
                                      '5d061d1c-a5f3-4cbf-bf2a-a18d015fa342_4c7a6e64-774c-4bce-a886-44284a302789#b0a77dda-be90-4877-b4fa-03c90f20d78f',
                                  },
                                ],
                                matcher: 'eq',
                                value: 0,
                              },
                              type: 'historical',
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: '~timestampu',
                                      matcher: 'lt',
                                      values: [2493100800],
                                    },
                                    type: 'matcher',
                                  },
                                ],
                                logic: 'and',
                              },
                              type: 'group',
                            },
                          ],
                          logic: 'and',
                        },
                        type: 'group',
                      },
                      consequences: [
                        {
                          id: '6df624a6-19cd-4edd-a36d-a032d0425e4d',
                          type: 'schema',
                          detail: {
                            id: '6df624a6-19cd-4edd-a36d-a032d0425e4d',
                            schema:
                              'https://ns.adobe.com/personalization/message/content-card',
                            data: {
                              content: {
                                actionUrl: '',
                                body: { content: '4K Smart TV 65-inch' },
                                buttons: [],
                                image: {
                                  alt: '',
                                  url: 'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                                },
                                dismissBtn: { style: 'none' },
                                title: { content: 'VisionTech' },
                              },
                              contentType: 'application/json',
                              meta: {
                                title: '4K Smart TV 65-inch',
                                brand: 'VisionTech',
                                originalPrice: '999.99',
                                discountedPrice: '649.99',
                                discountPercentage: '35',
                                validUntil: '2024-11-24T23:59:59Z',
                                category: 'Electronics',
                                tags: 'TV,Smart Home,4K,Featured',
                                thumbnailUrl:
                                  'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?q=80&w=2584&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                                description:
                                  'Immerse yourself in stunning 4K resolution with this 65-inch smart TV. Features HDR, built-in streaming apps, and voice control compatibility.',
                                highlights:
                                  'Save $350,Free Wall Mount Kit,Free Installation',
                                available: 'true',
                                adobe: { template: 'SmallImage' },
                                surface:
                                  'web://journey-prioritization-demo.vercel.app/#home',
                              },
                              publishedDate: 1731718328,
                              expiryDate: 2493100800,
                            },
                          },
                        },
                      ],
                    },
                  ],
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
          };
        })
        .filter(Boolean); // Remove any null entries

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
