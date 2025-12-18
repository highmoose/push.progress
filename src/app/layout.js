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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${roboto.variable} ${tektur.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
