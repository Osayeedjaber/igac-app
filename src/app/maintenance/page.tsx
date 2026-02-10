export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#d4af37]/10 blur-[100px] rounded-full" />
      </div>
      
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">IGAC</span>
        </div>
        
        {/* Main Message */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
          Under Maintenance
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          We're currently updating our website to serve you better. 
          We'll be back online shortly.
        </p>
        
        {/* Contact Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>For urgent inquiries, please contact us at:</p>
          <p className="text-white font-medium">
            📧 intlglobalaffairscouncil@gmail.com
          </p>
          <p className="text-white font-medium">
            📞 +880 18153-53082
          </p>
        </div>
        
        {/* Progress Animation */}
        <div className="mt-12">
          <div className="w-64 h-2 mx-auto bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-[#d4af37] animate-pulse" style={{width: "70%"}}></div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">System updates in progress...</p>
        </div>
      </div>
    </main>
  );
}