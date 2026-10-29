import { AuthProvider } from "@/contexts/auth-context"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Light-themed auth pages — white/warm bg like the reference images */}
      <div className="min-h-screen font-body antialiased bg-[#f8f9fb] relative overflow-hidden flex items-center justify-center">
        
        {/* Subtle warm gradient blobs — decorative */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-100/60 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-pink-100/30 blur-[80px]" />

        {/* Content card — illustration + form together */}
        <div className="relative z-10 w-full max-w-[960px] mx-auto flex items-center gap-0 bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden min-h-[560px] m-6">
          
          {/* Left — illustration area */}
          <div className="hidden md:flex w-[45%] items-center justify-center p-10 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 self-stretch">
            <div className="text-center">
              <img
                src="/disaster-illustration.png"
                alt="Disaster preparedness"
                className="w-full max-w-[320px] mx-auto drop-shadow-lg"
              />
              <h2 className="text-gray-800 text-lg font-headline font-bold mt-6">
                Stay Prepared. Stay Safe.
              </h2>
              <p className="text-gray-500 text-xs mt-1 max-w-[260px] mx-auto">
                India&apos;s disaster preparedness &amp; response education platform for schools
              </p>
            </div>
          </div>

          {/* Right — form area */}
          <div className="flex-1 p-8 sm:p-12 flex items-center justify-center self-stretch">
            <div className="w-full max-w-[360px]">
              {children}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="absolute bottom-4 text-center w-full text-[10px] text-gray-400 z-10">
          © {new Date().getFullYear()} Suraksha · Disaster Preparedness Platform
        </p>
      </div>
    </AuthProvider>
  )
}
