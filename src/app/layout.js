import { Roboto, Tektur } from "next/font/google";
import "./globals.css";
import "boxicons/css/boxicons.min.css";
import { Providers } from "./providers";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const tektur = Tektur({
  variable: "--font-tektur",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Login",
  description: "Login to continue",
  manifest: "/manifest.json",
  themeColor: "#d0f500",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Push Progress",
  },
  icons: {
    icon: "/images/icon/icon-192.png",
    apple: "/images/icon/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon/icon-192.png" />
        <meta name="theme-color" content="#d0f500" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/splash/splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/splash/splash-1242x2208.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/splash/splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${roboto.variable} ${tektur.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
