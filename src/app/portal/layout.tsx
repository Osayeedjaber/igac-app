export const metadata = {
  title: "Secretariat Portal - IGAC",
  description: "Secure area for IGAC Secretariat members.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* We can add a simple Portal navbar here later if needed */}
      {children}
    </div>
  );
}
