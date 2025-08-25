"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

type Particle = {
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

function ParticleGrid() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 144 }).map(() => ({
      size: Math.random() > 0.9 ? 2 : 1,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-4">
      {particles.map((p, i) => (
        <div
          key={i}
          className="rounded-full bg-[#ffcc00]"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `pulse ${p.duration}s infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function CTASectionAlternative() {
  return (
    <section className="w-full py-20 bg-[#0a0a0a] relative overflow-hidden">
      <MaxWidthWrapper>
        {/* Background gradient and particles */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-[#0a0a0a] opacity-80"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-1/2 h-full">
            <ParticleGrid />
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white"
            >
              Get started today
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-4 text-gray-400"
            >
              Create a free account. No demos or calls with our sales team are
              required. Upgrade only if you have to.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="#get-started"
                className="inline-flex items-center gap-2 bg-[#ffcc00] hover:bg-[#e6b800] text-black transition-colors duration-300 rounded-md px-6 py-3 font-medium"
              >
                GET STARTED <ArrowRight size={16} />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 bg-transparent border border-white hover:bg-white/10 text-white transition-colors duration-300 rounded-md px-6 py-3 font-medium"
              >
                CONTACT US
              </Link>
            </motion.div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </MaxWidthWrapper>
    </section>
  );
}
