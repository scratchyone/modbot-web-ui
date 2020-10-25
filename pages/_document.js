import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';
class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="icon"
            type="image/png"
            href="https://cdn.discordapp.com/avatars/738517864016773241/45ceee959e8bc1a79584aaf73d01ff68.png"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
