import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ✅ PropellerAds Script here */}
        <script
          data-cfasync="false"
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(p,u,s,h){
                p._pcq=p._pcq||[];
                p._pcq.push(['_currentTime',Date.now()]);
                s=u.createElement('script');
                s.type='text/javascript';
                s.async=true;
                s.src='https://propu.sh/pfe/current/tag.min.js?z=9261203';
                h=u.getElementsByTagName('script')[0];
                h.parentNode.insertBefore(s,h);
              })(window,document);
            `
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
