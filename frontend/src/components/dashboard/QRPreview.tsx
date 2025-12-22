import { ExternalLink, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QRPreviewProps {
  storeName: string;
  naverPlaceUrl: string;
}

export function QRPreview({ storeName, naverPlaceUrl }: QRPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(naverPlaceUrl);
    toast.success("링크가 복사되었습니다!");
  };

  const handleRefresh = async () => {
    setIsGenerating(true);
    // Simulate QR regeneration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsGenerating(false);
    toast.success("QR 코드가 갱신되었습니다!");
  };

  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "600ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">매장 QR 코드</h3>
          <p className="text-sm text-muted-foreground">{storeName}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${isGenerating ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* QR Code Placeholder */}
        <div className="w-48 h-48 bg-foreground rounded-xl p-3 mb-4">
          <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-2"
            >
              {/* Simplified QR pattern */}
              <rect x="10" y="10" width="25" height="25" fill="currentColor" className="text-foreground" />
              <rect x="65" y="10" width="25" height="25" fill="currentColor" className="text-foreground" />
              <rect x="10" y="65" width="25" height="25" fill="currentColor" className="text-foreground" />
              <rect x="15" y="15" width="15" height="15" fill="currentColor" className="text-background" />
              <rect x="70" y="15" width="15" height="15" fill="currentColor" className="text-background" />
              <rect x="15" y="70" width="15" height="15" fill="currentColor" className="text-background" />
              <rect x="20" y="20" width="5" height="5" fill="currentColor" className="text-foreground" />
              <rect x="75" y="20" width="5" height="5" fill="currentColor" className="text-foreground" />
              <rect x="20" y="75" width="5" height="5" fill="currentColor" className="text-foreground" />
              {/* Center pattern */}
              <rect x="40" y="40" width="20" height="20" fill="currentColor" className="text-foreground" />
              <rect x="45" y="45" width="10" height="10" fill="currentColor" className="text-primary" />
              {/* Random dots */}
              {[...Array(20)].map((_, i) => (
                <rect
                  key={i}
                  x={Math.random() * 60 + 20}
                  y={Math.random() * 60 + 20}
                  width="5"
                  height="5"
                  fill="currentColor"
                  className="text-foreground"
                />
              ))}
            </svg>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 text-center">
          이 QR 코드를 스캔하면<br />네이버 플레이스로 연결됩니다
        </p>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            링크 복사
          </button>
          <a
            href={naverPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            바로가기
          </a>
        </div>
      </div>
    </div>
  );
}
