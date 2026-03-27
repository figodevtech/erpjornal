import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full bg-background flex flex-col items-center transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </>
  );
}
