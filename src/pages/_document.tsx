import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-[#FBF9F5] text-[#1C1917] antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

