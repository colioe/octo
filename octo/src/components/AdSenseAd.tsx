import Script from 'next/script';
import { memo } from 'react';

interface AdSenseAdProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

const AdSenseAd = memo(function AdSenseAd({
  adClient,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
}: AdSenseAdProps) {
  return (
    <>
      {/* Load AdSense Script */}
      <Script
        id="adsbygoogle-script"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        onError={(e) => console.error('AdSense failed to load', e)}
      />

      {/* Ad Container */}
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />

      {/* Initialize Ad */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </>
  );
});

export default AdSenseAd;