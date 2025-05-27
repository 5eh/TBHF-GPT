import { Analytics } from "@vercel/analytics/next";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { Footer } from "@/components/ui/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blogs.arthurlabs.net"),
  title: "TechBlog - Articles & Insights",
  description:
    "Discover the latest tech trends, insights, and in-depth articles from industry experts. Your go-to resource for technology news and knowledge.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <Navbar />
          <main className=" max-w-6xl mx-auto ">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
