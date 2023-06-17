import { Head, Html, Main, NextScript } from 'next/document';
import { staticPath } from 'src/utils/$path';
import { GA_ID } from 'src/utils/gtag';

function Document() {
  return (
    <Html lang="ja">
      <Head>
        <title>Online Othello</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Online Othello" />
        <link rel="icon" href={staticPath.othello_icon_png} />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
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

export default Document;
