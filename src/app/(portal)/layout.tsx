import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-red-700 focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 font-black uppercase text-xs tracking-widest transition-all">
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="main-content" className="flex-1 w-full bg-background flex flex-col items-center transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </>
  );
}

