import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'SURAKSHA | Disaster Preparedness & Response Education',
  description: 'Disaster Preparedness and Response Education System for Schools and Colleges. Interactive drills, training modules, and emergency tools aligned with NDMA guidelines.',
  keywords: ['disaster preparedness', 'school safety', 'NDMA', 'emergency response', 'education', 'India'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 
          DEV ONLY: Suppress Firestore HMR assertions BEFORE any JS modules load.
          Must be in <head> to run before Turbopack chunks evaluate.
        */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function(){
  var oe=console.error,ow=console.warn;
  function f(a){
    for(var i=0;i<a.length;i++){
      var s=typeof a[i]==='string'?a[i]:(a[i]&&a[i].message)||'';
      if(s.indexOf('INTERNAL ASSERTION FAILED')!==-1||s.indexOf('Unexpected state')!==-1)return true;
    }
    return false;
  }
  console.error=function(){if(!f(arguments))oe.apply(console,arguments)};
  console.warn=function(){if(!f(arguments))ow.apply(console,arguments)};
  window.addEventListener('error',function(e){
    var m=e.message||'';
    if(m.indexOf('INTERNAL ASSERTION FAILED')!==-1||m.indexOf('Unexpected state')!==-1){
      e.stopImmediatePropagation();e.preventDefault();return true;
    }
  },true);
  window.addEventListener('unhandledrejection',function(e){
    var m=e.reason&&(e.reason.message||String(e.reason))||'';
    if(m.indexOf('INTERNAL ASSERTION FAILED')!==-1||m.indexOf('Unexpected state')!==-1){
      e.stopImmediatePropagation();e.preventDefault();
    }
  },true);
})();
              `,
            }}
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
