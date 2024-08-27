import React from 'react';

export const dynamic = 'force-static';

export const metadata = {
  title: '404: This page could not be found',
  robots: {
    index: false,
  },
};

export default function NotFound() {
  return (
    <>
      <div className="font-sans h-screen flex flex-col items-center justify-center">
        <div>
          <h1 className="border-r border/30 inline-block mr-[20px] pr-[23px] text-[24px] primary font-medium align-top leading-[49px]">
            404
          </h1>
          <div className="inline-block">
            <h2 className="primary text-sm font-normal leading-[49px] m-0">
              This page could not be found.
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}
