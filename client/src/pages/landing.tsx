import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Smartphone, Zap, Share2 } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                LinkTap
              </span>
            </div>
            <div>
              <Button onClick={handleLogin}>Log In / Sign Up</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-gray-900 mb-6">
              The last business card <br className="hidden md:block" />
              <span className="text-primary">you'll ever need.</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
              Share your contact info, social links, and more with a single tap. 
              The smart, digital business card for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform" onClick={handleLogin}>
                Create Your Card
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                See How It Works
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 blur-3xl" />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">NFC Enabled</h3>
              <p className="text-gray-500">
                Write your profile directly to an NFC chip. Share simply by tapping your phone to another.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">One Link for Everything</h3>
              <p className="text-gray-500">
                Instagram, LinkedIn, Portfolio, Website - house all your digital presence under one sleek URL.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Instant Update</h3>
              <p className="text-gray-500">
                Changed jobs? New phone number? Update your profile instantly without reprinting cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
