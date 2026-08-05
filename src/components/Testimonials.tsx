"use client";

import { StoreConfig } from "@/lib/types";
import { useAutoTranslate } from "@/lib/use-auto-translate";

export default function Testimonials({ config }: { config: StoreConfig }) {
  const title = useAutoTranslate(config.testimoniTitle || "Testimoni Pelanggan");
  const text = useAutoTranslate(config.testimoniText || "Lihat testimoni kami di sosial media:");

  return (
    <div className="container" style={{ marginTop: 40, marginBottom: 40, textAlign: 'center' }}>
      <div className="section-title">{title}</div>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 20 }}>{text}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        <a 
          href={config.tiktokUrl}
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '8px 16px', 
            backgroundColor: '#1a1a1a', 
            color: '#fff', 
            borderRadius: 50, 
            fontSize: 14, 
            fontWeight: 600,
            border: '1px solid #444',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
        >
          <img src="https://cdn-icons-png.flaticon.com/128/3046/3046121.png" alt="TikTok" style={{ width: 20, height: 20 }} />
          TikTok
        </a>
        <a 
          href={config.instagramUrl}
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '8px 16px', 
            backgroundColor: '#1a1a1a', 
            color: '#fff', 
            borderRadius: 50, 
            fontSize: 14, 
            fontWeight: 600,
            border: '1px solid #444',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
        >
          <img src="https://cdn-icons-png.flaticon.com/128/2111/2111463.png" alt="Instagram" style={{ width: 20, height: 20 }} />
          Instagram
        </a>
      </div>
    </div>
  );
}
