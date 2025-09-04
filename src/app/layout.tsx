import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import FooterNavigation from "@/components/FooterNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnionPasscard - Universal Membership System",
  description: "Manage memberships across multiple venues and companies with one unified card",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UnionPasscard",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('🔧 SW registered: ', registration);
                      
                      // Check for updates every 30 seconds
                      setInterval(() => {
                        registration.update();
                      }, 30000);
                      
                      // Listen for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('🔧 New SW available, will refresh on next visit');
                              // Optionally show a toast notification here
                              // For now, just update automatically after 5 seconds
                              setTimeout(() => {
                                if (newWorker.state === 'waiting') {
                                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                                  window.location.reload();
                                }
                              }, 5000);
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                    
                  // Handle service worker updates
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔧 SW controller changed, reloading page');
                    window.location.reload();
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Navigation />
        <main className="min-h-screen bg-gray-50 pb-20">
          {children}
        </main>
        <FooterNavigation />
      </body>
    </html>
  );
}
