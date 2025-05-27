"use client";

import Image from "next/image";

interface PreviewProps {
  title: string;
  mission: string;
  image: string;
  tags: string[];
  gradient: string;
  verified?: boolean;
  premium?: boolean;
}

export default function Preview({
  title,
  mission,
  image,
  tags,
  gradient,
  verified = false,
  premium = false,
}: PreviewProps) {
  return (
    <div className={`w-full border overflow-hidden shadow-md transition-all duration-700 hover:scale-105 hover:z-10 hover:shadow-xl bg-gradient-to-br ${gradient}`}>
      <div className="h-48 overflow-hidden relative group">
        <div className="relative size-full">
          <Image
            src={
              image ||
              "https://images.unsplash.com/photo-1620778182530-703effa65a06?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJ0Y3xlbnwwfHwwfHx8MA%3D%3D"
            }
            alt={title}
            fill
            className="object-cover contrast-125 transition-all duration-700 ease-in-out grayscale group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-org.jpg";
            }}
          />
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {verified && (
            <span className="bg-primary/30 border backdrop-blur-md border-primary text-white text-xs px-2 py-1 rounded-bl-none rounded-tr-none rounded shadow-md">
              Verified
            </span>
          )}
          {premium && (
            <span className="bg-[#f7931a]/30 border border-[#f7931a] backdrop-blur-md text-white text-xs px-2 py-1 rounded-tl-none rounded-br-none rounded">
              Premium
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">
            {title}
          </h3>
        </div>
        <p className="text-sm text-white/80 mb-3">
          {mission}
        </p>
        <div className="flex flex-wrap gap-1 justify-end">
          {(tags || []).slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-200/20 text-white border border-white/20 hover:border-primary hover:text-primary text-xs px-2 py-1 rounded transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}