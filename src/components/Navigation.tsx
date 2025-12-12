"use client";

import { RefObject } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

interface NavigationProps {
  navLogoRef: RefObject<HTMLDivElement | null>;
}

export default function Navigation({ navLogoRef }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent text-white pointer-events-none">
      <div className="flex items-center justify-between px-6 md:px-8 lg:px-16 py-6">
        <div ref={navLogoRef} className="flex items-center gap-2 mix-blend-difference">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <rect x="0" y="0" width="8" height="24" fill="red"/>
            <rect x="8" y="0" width="8" height="24" fill="blue"/>
            <rect x="16" y="0" width="8" height="24" fill="green"/>
          </svg>
          <span className="text-2xl font-medium tracking-wider">ABLOH</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                LOGIN
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <a
              href="/dashboard"
              className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              DASHBOARD
            </a>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
