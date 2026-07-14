import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Buku } from "@/lib/db";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";

interface StikerDialogProps {
  isOpen: boolean;
  book: Buku | null;
  onClose: () => void;
}

export function StikerDialog({ isOpen, book, onClose }: StikerDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Stiker_${book?.judul || 'Buku'}`,
  });

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
          <div ref={printRef} className="bg-white border border-slate-400 p-0 m-0 print:border-none overflow-hidden" style={{ width: '8cm', height: '5cm' }}>
            <div className="flex h-full w-full">
              {/* Left Side: Barcode */}
              <div className="w-[45%] h-full flex flex-col items-center justify-center relative bg-white border-r border-slate-400">
                <div className="flex flex-col items-center justify-center" style={{ transform: 'rotate(-90deg)', width: '5cm', height: '100%' }}>
                  <span className="text-[10px] font-medium text-slate-800 mb-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[4cm]">{titleWords}</span>
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
              <div className="w-[55%] h-full flex flex-col bg-white">
                <div className="bg-white border-b border-slate-400 text-slate-900 text-center py-2 flex items-center justify-center min-h-[1.2cm]">
                  <span className="font-bold text-[12px] leading-tight px-2 uppercase tracking-wide">TAMAN BACA MANDIRI BIRU</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-1 py-1">
                  <span className="text-base font-bold text-slate-900 leading-none">{klasifikasi}</span>
                  <span className="text-base font-bold text-slate-900 leading-none">{authorCode}</span>
                  <span className="text-base font-bold text-slate-900 leading-none">{titleLetter}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Cetak Stiker (Print)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
