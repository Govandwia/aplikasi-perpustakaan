import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Buku } from "@/lib/db";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Barcode from "react-barcode";

interface StikerDialogProps {
  isOpen: boolean;
  book: Buku | null;
  onClose: () => void;
}

export function StikerDialog({ isOpen, book, onClose }: StikerDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    
    try {
      setIsDownloading(true);
      
      const dataUrl = await toPng(printRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      
      // Convert to image and download
      const link = document.createElement("a");
      const safeTitle = book?.judul?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'buku';
      link.href = dataUrl;
      link.download = `Stiker_${safeTitle}.png`;
      link.click();
      
    } catch (error) {
      console.error("Gagal membuat gambar stiker", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!book) return null;

  // Extract variables
  const klasifikasi = book.klasifikasi || "000";
  
  // Kun: 3 huruf pertama pengarang, Title Case
  let authorCode = book.pengarang.slice(0, 3).toLowerCase();
  if (authorCode.length > 0) {
    authorCode = authorCode.charAt(0).toUpperCase() + authorCode.slice(1);
  }
  
  // s: huruf pertama judul, lowercase
  const titleLetter = book.judul.charAt(0).toLowerCase();

  // 2 kata judul untuk barcode
  const titleWords = book.judul.split(' ').slice(0, 2).join(' ');

  // Barcode value: use ISBN if available, otherwise ID
  const barcodeValue = book.isbn || book.id.toString();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cetak Stiker Buku</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center p-4 bg-slate-100 rounded-md overflow-hidden">
          {/* Printable Area */}
          <div ref={printRef} className="p-0 m-0 border overflow-hidden" style={{ width: '8cm', height: '5cm', backgroundColor: '#ffffff', borderColor: '#94a3b8', boxSizing: 'border-box' }}>
            <div className="flex h-full w-full">
              {/* Left Side: Barcode */}
              <div className="w-[45%] h-full flex flex-col items-center justify-center relative border-r" style={{ backgroundColor: '#ffffff', borderColor: '#94a3b8' }}>
                <div className="flex flex-col items-center justify-center" style={{ transform: 'rotate(-90deg)', width: '5cm', height: '100%' }}>
                  <span className="text-[10px] font-medium mb-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[4cm]" style={{ color: '#1e293b' }}>{titleWords}</span>
                  <Barcode 
                    value={barcodeValue} 
                    width={1.2} 
                    height={35} 
                    fontSize={11} 
                    margin={0}
                    displayValue={true}
                    background="transparent"
                  />
                </div>
              </div>

              {/* Right Side: Text */}
              <div className="w-[55%] h-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
                <div className="border-b text-center py-1 flex flex-col items-center justify-center min-h-[1.2cm]" style={{ backgroundColor: '#ffffff', borderColor: '#94a3b8', color: '#0f172a' }}>
                  <span className="font-bold text-[9px] leading-tight px-2 uppercase tracking-wide">TAMAN BACA</span>
                  <span className="font-black text-[13px] leading-tight px-2 uppercase tracking-wide">MANDIRI BIRU</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-1 py-1">
                  <span className="text-base font-bold leading-none" style={{ color: '#0f172a' }}>{klasifikasi}</span>
                  <span className="text-base font-bold leading-none" style={{ color: '#0f172a' }}>{authorCode}</span>
                  <span className="text-base font-bold leading-none" style={{ color: '#0f172a' }}>{titleLetter}</span>
                </div>
                <div className="flex justify-center items-center gap-2 pb-2 px-2" style={{ backgroundColor: '#ffffff' }}>
                  <img src="/logo-ugm.png" alt="UGM" style={{ height: '18px', objectFit: 'contain' }} />
                  <img src="/logo-kkn.png" alt="KKN" style={{ height: '18px', objectFit: 'contain' }} />
                  <img src="/Logo sorak no background.png" alt="Sorak" style={{ height: '18px', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>Tutup</Button>
          <Button 
            onClick={handleDownloadImage} 
            disabled={isDownloading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isDownloading ? "Menyiapkan Gambar..." : "Simpan Gambar (Download)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
