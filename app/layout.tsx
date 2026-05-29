import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sundayestate.co.th"),
  title: {
    default: "Sunday Estate · บริษัท ซันเดย์ เอสเตท จำกัด",
    template: "%s · Sunday Estate",
  },
  description:
    "อสังหาริมทรัพย์ ที่ดิน จัดสรร และพัฒนาโครงการ — บริหารทรัพย์สิน สัญญา และจัดซื้อจัดจ้างภาครัฐ (e-GP) · Real estate, land subdivision & project development in Thailand.",
  keywords: [
    "Sunday Estate",
    "ซันเดย์ เอสเตท",
    "อสังหาริมทรัพย์",
    "ที่ดินจัดสรร",
    "ขายฝาก",
    "จำนอง",
    "e-GP",
    "real estate Thailand",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "Sunday Estate",
    images: [{ url: "/logo/sunday-logo-full.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="th"
      className={`${plexThai.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      {/* No body bg/color here — the Journey wrapper drives both via motion
          values that interpolate across the scroll (night → cream). Setting a
          static body bg fights with that and shows through if the wrapper
          ever fails to fill the viewport. */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
