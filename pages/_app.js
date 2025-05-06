import "../styles/globals.css";
import { useEffect } from "react";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Load GSAP from CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js"
        strategy="beforeInteractive"
      />

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
