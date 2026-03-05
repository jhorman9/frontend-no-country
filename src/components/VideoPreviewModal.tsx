import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Video } from "@/types/video.types";
import type { VideoRendition } from "@/types/processing.types";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  rendition: VideoRendition | null;
}

export const VideoPreviewModal = ({ isOpen, onClose, video, rendition }: VideoPreviewModalProps) => {
  const source = rendition?.outputUrl || rendition?.previewUrl || video?.secureUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Preview</DialogTitle>
        </DialogHeader>
        <div className="w-full aspect-video bg-white/25 rounded-lg overflow-hidden">
          {source ? (
            <video src={source} controls className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              No hay video disponible
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};