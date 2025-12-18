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
  title: "Push Progress",
  description: "Track your workout progress and compete with friends",
  manifest: "/manifest.json",
  themeColor: "#d0f500",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Push Progress",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/images/icon/icon-192.png" />
        <link rel="apple-touch-icon" href="/images/icon/icon-192.png" />
        <meta name="theme-color" content="#d0f500" />
      </head>
      <body className={`${roboto.variable} ${tektur.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
