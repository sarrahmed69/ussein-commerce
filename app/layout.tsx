import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavbarMain from "@/components/common/navbar/NavbarMain";
import Footer from "@/components/common/footer/Footer";
import { QueryProvider } from "@/providers/query-provider";
import { ProgressBarProviders } from "@/providers/progress-bar-provider";
import { Zoom, ToastContainer } from "react-toastify";

export const viewport: Viewport = {
  themeColor: "#4a7c2f",
};

export const metadata: Metadata = {
  title: "USSEIN Commerce | Campus Marketplace",
  description: "La marketplace du campus de l Universite du Sine Saloum El-Hadj Ibrahima Niass - Achetez et vendez facilement entre etudiants.",
  keywords: "USSEIN Commerce, Universite du Sine Saloum, campus marketplace, etudiant, vente, achat, Wave, Orange Money, FCFA, Senegal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "USSEIN Commerce",
  },
  openGraph: {
    title: "USSEIN Commerce - Campus Marketplace",
    description: "Achetez et vendez facilement sur le campus de l Universite du Sine Saloum El-Hadj Ibrahima Niass. Paiement Wave et Orange Money accepte.",
    url: "https://ussein-commerce.vercel.app",
    siteName: "USSEIN Commerce",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "https://ussein-commerce.vercel.app/images/USSEIN-logo.jpg",
        width: 1200,
        height: 630,
        alt: "USSEIN Commerce - Campus Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "USSEIN Commerce - Campus Marketplace",
    description: "Achetez et vendez facilement sur le campus USSEIN. Paiement Wave et Orange Money accepte.",
    images: ["https://ussein-commerce.vercel.app/images/USSEIN-logo.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="dns-prefetch" href="https://koqztlrfxeiolpwyxgum.supabase.co" />
        <link rel="preconnect" href="https://koqztlrfxeiolpwyxgum.supabase.co" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="USSEIN Commerce" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        <QueryProvider>
          <ProgressBarProviders>
            <NavbarMain />
            {children}
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              closeButton={false}
              hideProgressBar
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Zoom}
            />
          </ProgressBarProviders>
        </QueryProvider>
      </body>
    </html>
  );
}