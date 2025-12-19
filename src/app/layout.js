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
