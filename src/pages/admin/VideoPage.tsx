import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { videosApi } from "@/lib/api/videos.api";
import { processingApi } from "@/lib/api/processing.api";
import { VideoPreviewModal } from "@/components/VideoPreviewModal";
import { notifyProcessingComplete, requestNotificationPermission } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  Wand2,
  Loader2,
  Download,
  Trash2,
  Clock,
  XCircle,
  Play,
  Film,
  Smartphone,
  Settings2,
  Sparkles,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Video } from "@/types/video.types";
import type { ProcessVideoPayload, ProcessingJob, VideoRendition } from "@/types/processing.types";

const getEstadoTexto = (status: string) => {
  switch (status) {
    case "UPLOADED":
      return "Listo";
    case "PROCESSING":
      return "Procesando...";
    case "ERROR":
      return "Error";
    default:
      return status;
  }
};

const platformOptions = [
  { value: "tiktok", label: "TikTok", color: "text-pink-500" },
  { value: "instagram", label: "Instagram Reels", color: "text-purple-500" },
  { value: "youtube_shorts", label: "YouTube Shorts", color: "text-red-500" },
] as const;

const qualityOptions = [
  { value: "fast", label: "Rápido", desc: "Menor calidad, más rápido" },
  { value: "normal", label: "Normal", desc: "Balance óptimo" },
  { value: "high", label: "Alta calidad", desc: "Mejor calidad, más lento" },
] as const;

const backgroundModeOptions = [
  { value: "smart_crop", label: "Recorte inteligente", desc: "IA detecta el sujeto principal" },
  { value: "blurred", label: "Fondo difuminado", desc: "Video original como fondo blur" },
  { value: "black", label: "Barras negras", desc: "Fondo negro simple" },
] as const;

const jobStatusConfig = {
  pending: { label: "En cola", icon: Clock, className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  processing: { label: "Procesando", icon: RefreshCw, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  completed: { label: "Completado", icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  failed: { label: "Error", icon: AlertCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
  cancelled: { label: "Cancelado", icon: XCircle, className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
} as const;

const formatDuration = (millis: number): string => {
  if (!millis) return "0:00";
  
  // Si el valor es muy pequeño (< 2000), probablemente está en segundos sin convertir
  // En ese caso, lo interpretamos directamente como segundos
  const totalSeconds = millis < 2000 
    ? Math.floor(millis) 
    : Math.floor(millis / 1000);
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const VideoPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prevJobsRef = useRef<ProcessingJob[]>([]);
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();

  const [processingMode, setProcessingMode] = useState<ProcessVideoPayload["processingMode"]>("vertical");
  const [platform, setPlatform] = useState<ProcessVideoPayload["platform"]>("tiktok");
  const [quality, setQuality] = useState<ProcessVideoPayload["quality"]>("normal");
  const [backgroundMode, setBackgroundMode] = useState<ProcessVideoPayload["backgroundMode"]>("smart_crop");
  const [shortAutoDuration, setShortAutoDuration] = useState(0);
  const [shortStartTime, setShortStartTime] = useState(0);
  const [shortDuration, setShortDuration] = useState(0);

  const [isDeleteRenditionOpen, setIsDeleteRenditionOpen] = useState(false);
  const [selectedRendition, setSelectedRendition] = useState<VideoRendition | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [previewRendition, setPreviewRendition] = useState<VideoRendition | null>(null);

  const { data: videoData, isLoading: videoLoading } = useQuery({
    queryKey: ["video", projectId, videoId],
    enabled: Boolean(projectId && videoId),
    queryFn: async () => videosApi.getById(projectId as string, Number(videoId)),
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs", videoId],
    enabled: Boolean(videoId),
    queryFn: async () => processingApi.getJobs(videoId as string, { page: 0, size: 20 }),
    refetchInterval: 5000,
  });

  const {
    data: renditionsData,
    isLoading: renditionsLoading,
    refetch: refetchRenditions,
  } = useQuery({
    queryKey: ["renditions", videoId],
    enabled: Boolean(videoId),
    queryFn: async () => processingApi.getRenditions(videoId as string, { page: 0, size: 20 }),
  });

  const video = (videoData as { data?: Video } | undefined)?.data ?? (videoData as Video | undefined);
  const jobs = useMemo(
    () =>
      ((jobsData as { data?: { content?: ProcessingJob[] } })?.data?.content ??
        (jobsData as { content?: ProcessingJob[] })?.content ??
        []) as ProcessingJob[],
    [jobsData]
  );
  const renditions = useMemo(
    () =>
      ((renditionsData as { data?: { content?: VideoRendition[] } })?.data?.content ??
        (renditionsData as { content?: VideoRendition[] })?.content ??
        []) as VideoRendition[],
    [renditionsData]
  );
  const activeJobs = useMemo(
    () =>
      jobs.filter((j) => {
        const normalized = String(j.status || "").toLowerCase();
        return normalized === "pending" || normalized === "processing";
      }),
    [jobs]
  );

  useEffect(() => {
    const prevJobs = prevJobsRef.current;

    jobs.forEach((job) => {
      const currentId = job.id || job.jobId;
      const prevJob = prevJobs.find((p) => (p.id || p.jobId) === currentId);
      const currentStatus = String(job.status || "").toLowerCase();
      const prevStatus = String(prevJob?.status || "").toLowerCase();

      if (prevJob && prevStatus !== currentStatus) {
        if (currentStatus === "completed" || currentStatus === "failed") {
          notifyProcessingComplete(video?.title || "Video", currentStatus);
          if (currentStatus === "completed") {
            refetchRenditions();
          }
        }
      }
    });

    prevJobsRef.current = jobs;
  }, [jobs, video, refetchRenditions]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const processMutation = useMutation({
    mutationFn: (payload: ProcessVideoPayload) => processingApi.processVideo(videoId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", videoId] });
      toast.success("¡Procesamiento iniciado! Te notificaremos cuando termine.");
    },
    onError: () => {
      toast.error("Error al iniciar procesamiento");
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => processingApi.cancelJob(videoId as string, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", videoId] });
      toast.success("Job cancelado");
    },
    onError: () => {
      toast.error("Error al cancelar");
    },
  });

  const deleteRenditionMutation = useMutation({
    mutationFn: (renditionId: string) => processingApi.deleteRendition(videoId as string, renditionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renditions", videoId] });
      setIsDeleteRenditionOpen(false);
      toast.success("Rendición eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar");
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: () => videosApi.delete(projectId as string, Number(videoId)),
    onSuccess: () => {
      toast.success("Video eliminado");
      navigate(`/admin/videos?proyectoId=${projectId}`);
    },
    onError: () => {
      toast.error("No se pudo eliminar el video");
    },
  });

  const handleProcess = () => {
    const data: ProcessVideoPayload = {
      processingMode,
      platform,
      quality,
      backgroundMode,
    };

    if (processingMode === "short_auto") {
      data.shortAutoDuration = shortAutoDuration;
    } else if (processingMode === "short_manual") {
      data.shortOptions = {
        startTime: shortStartTime,
        duration: shortDuration,
      };
    }

    processMutation.mutate(data);
  };

  if (!projectId || !videoId) {
    return (
      <Card className="bg-destructive/10 border-destructive/50 backdrop-blur">
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">Parámetros de ruta inválidos</p>
          <Button onClick={() => navigate(-1)} className="bg-slate-700 hover:bg-slate-600 text-white">
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8" data-testid="video-page">
      <div className="space-y-3 lg:space-y-4">
        <Link
          to={`/admin/videos?proyectoId=${projectId}`}
          className="inline-flex items-center gap-2 text-xs lg:text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4 group-hover:-translate-x-1 transition-transform" />
          Volver al proyecto
        </Link>
        {videoLoading ? (
          <Skeleton className="h-8 lg:h-10 w-48 lg:w-64" />
        ) : (
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">{video?.title || "Video"}</h1>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {videoLoading ? (
            <Skeleton className="aspect-video w-full rounded-lg lg:rounded-2xl" />
          ) : video?.secureUrl ? (
            <div className="relative aspect-video bg-black rounded-lg lg:rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={video.secureUrl}
                controls
                className="w-full h-full"
                data-testid="video-player"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
              <Film className="h-20 w-20 text-white/20" />
            </div>
          )}

          {video && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Duración", value: formatDuration(video.durationInMillis) },
                { label: "Resolución", value: `${video.width}×${video.height}` },
                { label: "Formato", value: (video.format || "MP4").toUpperCase() },
                { label: "Estado", value: getEstadoTexto(video.status), isStatus: true },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/40">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className={`font-semibold ${item.isStatus ? "text-green-500" : "text-white"}`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <Tabs defaultValue="renditions" className="space-y-6">
            <TabsList className="w-full grid grid-cols-2 h-12 p-1 bg-muted/50">
              <TabsTrigger value="renditions" className="data-[state=active]:bg-background" data-testid="renditions-tab">
                <Smartphone className="mr-2 h-4 w-4" />
                Videos procesados ({renditions.length})
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-background" data-testid="jobs-tab">
                <Clock className="mr-2 h-4 w-4" />
                Jobs {activeJobs.length > 0 && `(${activeJobs.length} activos)`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="renditions" className="space-y-4">
              {renditionsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
                  ))}
                </div>
              ) : renditions.length === 0 ? (
                <Card className="text-center py-12 border-dashed border-2">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">No hay videos procesados</h3>
                      <p className="text-muted-foreground text-sm">Usa el panel de la derecha para convertir tu video</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {renditions.map((rendition) => (
                    <Card key={rendition.id} className="overflow-hidden border-border/50 group" data-testid={`rendition-${rendition.id}`}>
                      <div className="relative aspect-[9/16] bg-gradient-to-br from-slate-800 to-slate-900">
                        {rendition.thumbnailUrl ? (
                          <img src={rendition.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : rendition.outputUrl || rendition.previewUrl ? (
                          <video
                            src={rendition.outputUrl || rendition.previewUrl}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Smartphone className="h-12 w-12 text-white/20" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            size="icon"
                            className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black"
                            onClick={() => {
                              setPreviewVideo(video || null);
                              setPreviewRendition(rendition);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                          </Button>
                        </div>

                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">{rendition.platform || "-"}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {rendition.processingMode || "vertical"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{rendition.quality || "Normal"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            onClick={() => {
                              setPreviewVideo(video || null);
                              setPreviewRendition(rendition);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          {rendition.outputUrl && (
                            <Button asChild size="sm" variant="outline">
                              <a href={rendition.outputUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRendition(rendition);
                              setIsDeleteRenditionOpen(true);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              {jobsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <Card className="text-center py-12 border-dashed border-2">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">No hay jobs</h3>
                      <p className="text-muted-foreground text-sm">Los jobs aparecerán aquí cuando proceses un video</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => {
                    const normalizedStatus = String(job.status || "pending").toLowerCase() as keyof typeof jobStatusConfig;
                    const status = jobStatusConfig[normalizedStatus] || jobStatusConfig.pending;
                    const StatusIcon = status.icon;
                    const renderedJobId = String(job.id || job.jobId || "");

                    return (
                      <Card key={renderedJobId || Math.random()} className="border-border/50" data-testid={`job-${renderedJobId}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${status.className}`}>
                                <StatusIcon className={`h-5 w-5 ${normalizedStatus === "processing" ? "animate-spin" : ""}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${status.className} border font-medium`}>{status.label}</Badge>
                                  <span className="text-sm font-medium">{job.processingMode || "vertical"}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">ID: {renderedJobId.slice(0, 8)}...</p>
                              </div>
                            </div>
                            {(normalizedStatus === "pending" || normalizedStatus === "processing") && renderedJobId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelJobMutation.mutate(renderedJobId)}
                                disabled={cancelJobMutation.isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                          {normalizedStatus === "processing" && (
                            <Progress value={job.progress || 50} className="mt-4 h-2" />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:sticky lg:top-24">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="p-1.5 lg:p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Wand2 className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                </div>
                Procesar video
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">Convierte a formato vertical 9:16 para redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              <div className="space-y-3">
                <Label className="text-xs lg:text-sm font-medium">Modo de procesamiento</Label>
                <div className="grid gap-2">
                  {[
                    { value: "vertical", label: "Video completo", desc: "Convierte todo el video" },
                    { value: "short_auto", label: "Short automático", desc: "IA selecciona el mejor momento" },
                    { value: "short_manual", label: "Short manual", desc: "Tú eliges inicio y duración" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setProcessingMode(mode.value as ProcessVideoPayload["processingMode"])}
                      className={`w-full p-2.5 lg:p-3 rounded-lg border text-left transition-all ${
                        processingMode === mode.value ? "border-purple-500 bg-purple-500/10" : "border-border hover:border-purple-500/50"
                      }`}
                    >
                      <p className="font-medium text-xs lg:text-sm">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs lg:text-sm">Plataforma destino</Label>
                <Select value={platform} onValueChange={(value) => setPlatform(value as ProcessVideoPayload["platform"])}>
                  <SelectTrigger className="h-9 lg:h-11 text-xs lg:text-sm" data-testid="platform-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={opt.color}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs lg:text-sm">Calidad</Label>
                <Select value={quality} onValueChange={(value) => setQuality(value as ProcessVideoPayload["quality"])}>
                  <SelectTrigger className="h-9 lg:h-11 text-xs lg:text-sm" data-testid="quality-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs lg:text-sm">Modo de fondo</Label>
                <Select
                  value={backgroundMode}
                  onValueChange={(value) => setBackgroundMode(value as ProcessVideoPayload["backgroundMode"])}
                >
                  <SelectTrigger className="h-9 lg:h-11 text-xs lg:text-sm" data-testid="background-mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundModeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {processingMode === "short_auto" && (
                <div className="space-y-3 p-3 lg:p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between">
                    <Label className="text-xs lg:text-sm">Duración del short</Label>
                    <span className="text-xs lg:text-sm font-medium text-purple-500">{shortAutoDuration}s</span>
                  </div>
                  <Slider
                    value={[shortAutoDuration]}
                    onValueChange={([v]) => setShortAutoDuration(v)}
                    min={5}
                    max={video.durationInMillis ?? 0}
                    step={1}
                    className="py-2"
                    data-testid="short-duration-slider"
                  />
                </div>
              )}

              {processingMode === "short_manual" && (
                <div className="space-y-4 p-3 lg:p-4 rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label className="text-xs lg:text-sm">Tiempo de inicio (segundos)</Label>
                    <Input
                      type="number"
                      value={shortStartTime}
                      onChange={(e) => setShortStartTime(Number(e.target.value))}
                      min={0}
                      className="h-9 lg:h-11 text-xs lg:text-sm"
                      data-testid="short-start-time-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs lg:text-sm">Duración</Label>
                      <span className="text-xs lg:text-sm font-medium text-purple-500">{shortDuration}s</span>
                    </div>
                    <Slider
                      value={[shortDuration]}
                      onValueChange={([v]) => setShortDuration(v)}
                      min={5}
                      max={video.durationInMillis}
                      step={1}
                      data-testid="short-manual-duration-slider"
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full h-10 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all text-sm lg:text-base font-medium"
                onClick={handleProcess}
                disabled={processMutation.isPending}
                data-testid="process-video-button"
              >
                {processMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                )}
                Convertir a vertical
              </Button>

              <Button
                variant="outline"
                className="w-full h-10 lg:h-12 border-destructive/50 text-destructive hover:bg-destructive/10 text-sm lg:text-base"
                onClick={() => deleteVideoMutation.mutate()}
                disabled={deleteVideoMutation.isPending}
              >
                {deleteVideoMutation.isPending ? <Loader2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4 animate-spin" /> : <Trash2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />}
                Eliminar video original
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <VideoPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewRendition(null);
        }}
        video={previewVideo}
        rendition={previewRendition}
      />

      <AlertDialog open={isDeleteRenditionOpen} onOpenChange={setIsDeleteRenditionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar video procesado?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRendition?.id && deleteRenditionMutation.mutate(selectedRendition.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteRenditionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoPage;