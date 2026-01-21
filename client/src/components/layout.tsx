import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User, Layers, Radio, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isAdmin = (user as any)?.claims?.email === "badrdiab2020@gmail.com" || (user as any)?.claims?.is_admin;

  const tabs = [
    { name: "Profile", path: "/dashboard", icon: User },
    { name: "Links", path: "/dashboard/links", icon: Layers },
    { name: "NFC", path: "/dashboard/nfc", icon: Radio },
  ];

  if (isAdmin) {
    tabs.push({ name: "Admin", path: "/dashboard/admin", icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Know Who I Am
        </h1>
        <button
          onClick={() => window.location.href = "/api/logout"}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Logout
        </button>
      </div>

      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-6 py-3 flex justify-around items-center
        md:relative md:border-t-0 md:border-r md:flex-col md:justify-start md:w-64 md:h-screen md:p-6 md:space-y-6 md:items-start
      ">
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Know Who I Am
          </h1>
        </div>

        <div className="flex w-full md:flex-col md:space-y-2 justify-around md:justify-start">
          {tabs.map((tab) => {
            const isActive = location === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={cn(
                  "flex flex-col md:flex-row items-center md:space-x-3 p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/5 md:bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                )}
              >
                <tab.icon className={cn("w-6 h-6 md:w-5 md:h-5", isActive && "text-primary")} />
                <span className="text-[10px] md:text-sm mt-1 md:mt-0">{tab.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block mt-auto pt-8 w-full border-t">
          <button
            onClick={() => window.location.href = "/api/logout"}
            className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-2xl mx-auto md:mx-0">
          {children}
        </div>
      </main>
    </div>
  );
}
