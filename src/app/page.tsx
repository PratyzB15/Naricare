'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Public images
const logoSrc = '/images/logo.png';
const doctorImgSrc = '/images/doctor.png'; // use the transparent/updated doctor image
const periodIcon = '/images/period-icon.png';
const pregnancyIcon = '/images/pregnancy-icon.png';
const cancerIcon = '/images/cancer-icon.png';
const medcartIcon = '/images/medcart-icon.png';
const profilePic = '/images/pic.jpg';

const features = [
  { img: periodIcon, title: 'Period Tracking', desc: 'Track your cycle with ease and accuracy.' },
  { img: pregnancyIcon, title: 'Pregnancy Care', desc: 'Monitor and manage your pregnancy journey.' },
  { img: cancerIcon, title: 'Cancer Self Test', desc: 'Early detection self-assessment tools.' },
  { img: medcartIcon, title: 'MedCart', desc: 'Access medicines and health essentials quickly.' },
];

// ✅ Wavy background generator
const generateWaves = (
  id: string,
  color1: string,
  color2: string,
  count: number = 12
): JSX.Element => {
  const paths: JSX.Element[] = [];

  for (let i = 0; i < count; i++) {
    paths.push(
      <path
        key={`${id}-${i}`}
        d={`
          M ${100 + i * 5}, ${300 - i * 15}
          C ${200 + i * 20}, ${100 + i * 10}, ${400 - i * 15}, ${500 + i * 5}, ${600}, ${300 + i * 10}
        `}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.5"
        opacity={0.5 - i * 0.03}
      />
    );
  }

  return (
    <svg
      key={id}
      className="absolute w-[900px] h-[900px] opacity-35"
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      {paths}
    </svg>
  );
};

const HeroSection: React.FC = () => {
  const [tracking, setTracking] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  return (
    <div className="relative w-screen min-h-screen bg-gradient-to-br from-pink-100 via-fuchsia-50 to-purple-100 overflow-hidden">
      
      {/* Background Wavy Line Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 scale-125">
          {generateWaves("waveRed", "#ff4e50", "#dd2476", 20)}
        </div>
        <div className="absolute bottom-0 -right-40 scale-125 rotate-180">
          {generateWaves("waveYellow", "#FFD700", "#FF8C00", 18)}
        </div>
        <div className="absolute top-1/3 -left-60 scale-110 rotate-12">
          {generateWaves("wavePeach", "#ff9a9e", "#fecfef", 16)}
        </div>
        <div className="absolute bottom-1/4 right-0 scale-125 -rotate-12">
          {generateWaves("waveBlue", "#89f7fe", "#66a6ff", 18)}
        </div>
        <div className="absolute top-1/2 left-1/4 scale-100 rotate-45">
          {generateWaves("waveMix", "#ff6a00", "#ee0979", 15)}
        </div>
        {/* ✨ Extra wavy sets for richer background */}
        <div className="absolute -bottom-20 left-1/3 scale-125 rotate-6">
          {generateWaves("waveExtra", "#9d50bb", "#6e48aa", 14)}
        </div>
        <div className="absolute top-10 right-1/4 scale-90 -rotate-12">
          {generateWaves("waveLight", "#fbc2eb", "#a6c1ee", 12)}
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
  {/* 🔴 Red to Pink */}
  <div className="absolute -top-40 -left-40 scale-125">
    {generateWaves("waveRed", "#ff4e50", "#dd2476", 20)}
  </div>

  {/* 🟡 Yellow to Orange */}
  <div className="absolute bottom-0 -right-40 scale-125 rotate-180">
    {generateWaves("waveYellow", "#FFD700", "#FF8C00", 18)}
  </div>

  {/* 🍑 Peach to Light Pink */}
  <div className="absolute top-1/3 -left-60 scale-110 rotate-12">
    {generateWaves("wavePeach", "#ff9a9e", "#fecfef", 16)}
  </div>

  {/* 🔵 Aqua to Blue */}
  <div className="absolute bottom-1/4 right-0 scale-125 -rotate-12">
    {generateWaves("waveBlue", "#89f7fe", "#66a6ff", 18)}
  </div>

  {/* 🟠 Orange to Magenta */}
  <div className="absolute top-1/2 left-1/4 scale-100 rotate-45">
    {generateWaves("waveMix", "#ff6a00", "#ee0979", 15)}
  </div>

  {/* 🟣 Purple to Deep Violet */}
  <div className="absolute -bottom-20 left-1/3 scale-125 rotate-6">
    {generateWaves("wavePurple", "#9d50bb", "#6e48aa", 14)}
  </div>

  {/* 🌸 Light Pink to Blue */}
  <div className="absolute top-10 right-1/4 scale-90 -rotate-12">
    {generateWaves("wavePastel", "#fbc2eb", "#a6c1ee", 12)}
  </div>

  {/* 🟢 Green Minty tones */}
  <div className="absolute top-1/4 left-1/2 scale-110 rotate-3">
    {generateWaves("waveGreen", "#43e97b", "#38f9d7", 15)}
  </div>

  {/* 🌅 Sunset Vibe */}
  <div className="absolute bottom-1/2 right-1/3 scale-100 rotate-180">
    {generateWaves("waveSunset", "#f83600", "#f9d423", 16)}
  </div>

  {/* ⚪ White Glow effect */}
  <div className="absolute bottom-10 left-1/4 scale-95 rotate-12 opacity-60">
    {generateWaves("waveGlow", "#ffffff", "#dcdcdc", 10)}
  </div>

  {/* 🌊 Blue-Green Ocean */}
  <div className="absolute top-1/6 right-1/5 scale-105 -rotate-6">
    {generateWaves("waveOcean", "#00c6ff", "#0072ff", 14)}
  </div>

  {/* 🌈 Top-Right Corner Waves */}
<div className="absolute -top-32 -right-32 scale-125 rotate-12">
  {generateWaves("waveTopRight", "#ff7eb3", "#ff758c", 18)}
</div>
<div className="absolute top-20 right-10 scale-100 -rotate-6 opacity-80">
  {generateWaves("waveTopRight2", "#43e97b", "#38f9d7", 14)}
</div>
<div className="absolute top-1/4 right-1/6 scale-110 rotate-3 opacity-70">
  {generateWaves("waveTopRight3", "#00c6ff", "#0072ff", 12)}
</div>

</div>

      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-50">
        <Image
          src={logoSrc}
          alt="NARICARE Logo"
          width={80}
          height={80}
          priority
          className="rounded-full border border-pink-80 shadow-md"
        />
      </div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between min-h-screen px-6 py-12 lg:px-24 lg:py-8 relative z-10">
        
        {/* Left Content */}
        <div className="flex-1 w-full max-w-5xl animate-fade-in mt-16 lg:mt-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-gray-800 text-center">
            Your Health <span className="text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">Your Priority</span>
          </h1>
          
          <div className="text-center mt-6">
            <p className="text-xl sm:text-2xl font-medium text-gray-600">
              A Platform for Every Stage of Women's Wellness
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mt-4 max-w-3xl mx-auto">
              From period tracking and pregnancy care to fertility insights, self-checks, emergency SOS, 
              and personalized wellness guidance — all designed to empower every woman, everywhere.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link href="/signin">
              <button
                onClick={() => setTracking(!tracking)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg px-8 py-4 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {tracking ? "Stop Tracking" : "Start Tracking Now"}
              </button>
            </Link>
            <Link href="/signin">
              <button
                onClick={() => setSignedIn(!signedIn)}
                className="bg-white text-pink-600 border-2 border-pink-200 text-lg px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {signedIn ? "Signed In" : "Sign In"}
              </button>
            </Link>
          </div>

          {/* Feature Cards */}
          <motion.div
            className="flex flex-row justify-center gap-6 pt-14 overflow-x-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.25 }
              }
            }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="feature-card min-w-[220px] max-w-[240px] p-6 rounded-2xl text-center bg-white/60 backdrop-blur-sm border border-white/50 shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
                }}
              >
                <Image
                  src={feature.img}
                  alt={feature.title}
                  width={70}
                  height={70}
                  className="mx-auto mb-4 drop-shadow"
                />
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 mt-2">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Doctor Image - moved lower */}
        <div className="flex-1 flex justify-center lg:justify-end mt-12 lg:mt-auto relative pb-10">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[480px] lg:h-[560px]">
            <Image
              src={doctorImgSrc}
              alt="Doctor Illustration"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
            <div className="absolute -left-4 top-1/3 w-14 h-14 bg-pink-200 rounded-full animate-float opacity-70"></div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-200 rounded-full animate-float opacity-50" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm bg-gradient-to-t from-transparent to-pink-50">
        © 2025 NARICARE. All rights reserved.
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1.2s ease-out forwards;
        }
        .feature-card:hover {
          transform: scale(1.06);
        }
        .drop-shadow {
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
