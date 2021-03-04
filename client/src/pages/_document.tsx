import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { ColorModeScript } from '@chakra-ui/react';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.io" />

          <meta name="theme-color" content="#ff4500" />
          <meta
            name="description"
            content="Reddit is a network of communities based on people&#x27;s interests. Find communities you&#x27;re interested in, and become part of an online community!"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="canonical" href="https://reddit-clone.tech/" />

          <meta property="og:image" content="/" />
          <meta
            property="og:title"
            content="reddit: the front page of the internet"
          />
          <meta
            property="og:description"
            content="Reddit is a network of communities based on people&#x27;s interests."
          />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@DarieSebastian6" />
          <meta name="twitter:title" content="RedditClone" />
          <meta property="twitter:url" content="https://reddit-clone.tech/" />
        </Head>
        <body>
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
