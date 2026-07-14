import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-2 text-slate-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            className={isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
