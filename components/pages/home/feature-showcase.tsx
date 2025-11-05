"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { motion } from "framer-motion";

function RandomBinaryGrid() {
  const [bits, setBits] = useState<
    { value: string; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 200 }).map(() => ({
      value: Math.random() > 0.5 ? "1" : "0",
      duration: Math.random() * 5 + 2,
      delay: Math.random() * 2,
    }));
    setBits(generated);
  }, []);

  return (
    <div className="w-full h-full flex flex-wrap">
      {bits.map((bit, i) => (
        <div
          key={i}
          className="text-[8px] text-[#ffcc00]"
          style={{
            animation: `blink ${bit.duration}s infinite`,
            animationDelay: `${bit.delay}s`,
          }}
        >
          {bit.value}
        </div>
      ))}
    </div>
  );
}

export default function FeaturesShowcase() {
  return (
    <section className="w-full py-20 bg-[#0a0a0a] text-white overflow-hidden">
      <MaxWidthWrapper>
        {/* ... other features */}

        {/* Feature 3: Advanced Encryption */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="bg-[#0d0d0d] rounded-lg p-4 mb-6 h-48 flex items-center justify-center">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Encryption key visualization */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 font-mono text-[#ffcc00] text-sm mb-4 relative overflow-hidden">
                  f794fd0j6LXwZC
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffcc00]/20 to-transparent w-[200%] animate-[slide_3s_linear_infinite]"></div>
                </div>

                {/* Binary background (hydration safe) */}
                <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                  <RandomBinaryGrid />
                </div>

                {/* Lock icon */}
                <div className="relative z-10">
                  <svg
                    className="w-16 h-16 text-[#ffcc00] animate-pulse"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white">
              Advanced Encryption
            </h3>
            <p className="text-gray-400 mt-2">
              Be sure that sensitive information remains confidential and secure
              with our military-grade encryption protocols.
            </p>
          </div>
        </motion.div>
      </MaxWidthWrapper>
    </section>
  );
}
