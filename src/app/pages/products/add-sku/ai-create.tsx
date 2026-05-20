import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Info,
  Loader2,
  RotateCcw,
  Save,
  ScanBarcode,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  Wand2,
  X,
} from "lucide-react";

import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { cn } from "../../../components/ui/utils";
import {
  preprocessImage,
  searchMatches,
  thumbnailColorFor,
  MANDATORY_FIELDS,
  FIELD_LABELS,
  type AiField,
  type AiProductMatch,
  type AiSearchResponse,
  type AiSearchSource,
  type ConfidenceLevel,
  type ImageProcessingResult,
  type MatchTier,
  type NutritionRow,
} from "../../../lib/ai-sku-service";
import {
  identifyProductWithClaude,
  isRealAiAvailable,
} from "../../../lib/ai-sku-real-service";

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  label: string;
}

type Step = "upload" | "processing" | "matches" | "preview";

const MAX_IMAGES = 4;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED = [".jpg", ".jpeg", ".png", ".webp"];

const RECOMMENDED_LABELS = [
  "Front product image",
  "Back / label",
  "Barcode",
  "Side / package",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AiCreateSku() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("upload");
  const realAi = isRealAiAvailable();

  // --- Upload state ----------------------------------------------------------
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Revoke blob URLs on unmount.
  useEffect(() => {
    return () => {
      for (const img of images) URL.revokeObjectURL(img.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      if (!files.length) return;

      setImages((prev) => {
        const slotsLeft = MAX_IMAGES - prev.length;
        if (slotsLeft <= 0) {
          toast.error(`Maximum ${MAX_IMAGES} images`, {
            description: "Remove one to add another.",
          });
          return prev;
        }
        const next: UploadedImage[] = [...prev];
        for (const file of files.slice(0, slotsLeft)) {
          const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
          if (!ACCEPTED.includes(ext)) {
            toast.error(`Skipped ${file.name}`, {
              description: `Only ${ACCEPTED.join(", ")} files supported.`,
            });
            continue;
          }
          if (file.size > MAX_FILE_BYTES) {
            toast.error(`${file.name} is too large`, {
              description: "Each image must be under 8 MB.",
            });
            continue;
          }
          next.push({
            id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
            file,
            url: URL.createObjectURL(file),
            label: RECOMMENDED_LABELS[next.length] ?? "Additional image",
          });
        }
        return next;
      });
    },
    [],
  );

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  // --- Processing state ------------------------------------------------------
  const [logLines, setLogLines] = useState<string[]>([]);
  const [perImageResults, setPerImageResults] = useState<ImageProcessingResult[]>([]);
  const [queriedSources, setQueriedSources] = useState<AiSearchSource[]>([]);
  const [progress, setProgress] = useState(0);

  const appendLog = (line: string) =>
    setLogLines((prev) => [...prev, line]);

  const runAiPipeline = async () => {
    if (images.length === 0) {
      toast.error("Add at least one image first");
      return;
    }
    setStep("processing");
    setLogLines([]);
    setPerImageResults([]);
    setQueriedSources([]);
    setProgress(0);

    if (realAi) {
      try {
        appendLog("Mode: Live AI (Claude Opus 4.7 Vision)");
        setProgress(20);
        const response = await identifyProductWithClaude(
          images.map((i) => i.file),
          {
            onLog: (line) => {
              appendLog(line);
              setProgress((p) => Math.min(95, p + 6));
            },
            onSourceQueried: (src) =>
              setQueriedSources((prev) =>
                prev.includes(src) ? prev : [...prev, src],
              ),
          },
        );
        setPerImageResults(response.perImage);
        setProgress(100);
        appendLog(
          response.noConfidentMatch
            ? "No confident match — opening manual fallback."
            : `Found ${response.matches.length} candidate match(es).`,
        );
        setAiResponse(response);
        setStep("matches");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        appendLog(`Error from Claude API: ${msg}`);
        toast.error("Live AI call failed", { description: msg });
        setStep("upload");
      }
      return;
    }

    appendLog("Mode: Demo (no API key set) — using mock catalog");
    appendLog("Starting AI pipeline…");
    const results: ImageProcessingResult[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      appendLog(`Image ${i + 1}/${images.length} (${img.label}) — ${img.file.name}`);
      const res = await preprocessImage(img.file.name, (note) =>
        appendLog(`  • ${note}`),
      );
      results.push(res);
      setPerImageResults([...results]);
      setProgress(Math.round(((i + 1) / (images.length + 1)) * 70));
    }

    appendLog("Cross-checking marketplace + brand sources…");
    const response = await searchMatches(results, (src) => {
      appendLog(`  ↳ Queried ${src}`);
      setQueriedSources((prev) => [...prev, src]);
    });
    setProgress(100);
    appendLog(
      response.noConfidentMatch
        ? "No confident match — opening manual fallback."
        : `Found ${response.matches.length} candidate match(es).`,
    );
    setAiResponse(response);
    setStep("matches");
  };

  // --- Match selection -------------------------------------------------------
  const [aiResponse, setAiResponse] = useState<AiSearchResponse | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const selectMatch = (matchId: string) => {
    if (!aiResponse) return;
    const match = aiResponse.matches.find((m) => m.matchId === matchId);
    if (!match) return;
    setSelectedMatchId(matchId);
    setFormValues(matchToFormValues(match));
    setManualFallback(false);
    setStep("preview");
  };

  // Fallback when nothing matched — keep whatever OCR was extracted.
  const [manualFallback, setManualFallback] = useState(false);
  const startManual = () => {
    setSelectedMatchId(null);
    setManualFallback(true);
    setFormValues(ocrToFormValues(perImageResults));
    setStep("preview");
  };

  // --- Preview / edit form ---------------------------------------------------
  const [formValues, setFormValues] = useState<FormValues>(emptyFormValues());
  const [editedFields, setEditedFields] = useState<Set<keyof FormValues>>(
    new Set(),
  );

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setEditedFields((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const selectedMatch = aiResponse?.matches.find(
    (m) => m.matchId === selectedMatchId,
  );

  const missingMandatory = useMemo(() => {
    return MANDATORY_FIELDS.filter((field) => {
      const formKey = field as keyof FormValues;
      const val = formValues[formKey];
      return typeof val === "string" ? val.trim().length === 0 : !val;
    });
  }, [formValues]);

  const handleCreate = () => {
    if (missingMandatory.length > 0) {
      toast.error("Fill mandatory fields", {
        description: `${missingMandatory.length} required field(s) still missing.`,
      });
      return;
    }

    toast.success("SKU created via AI", {
      description: `${formValues.brandName} — ${formValues.productName}. Source: AI Generated.`,
    });
    navigate("/products/my-sku");
  };

  const handleSaveDraft = () => {
    toast.message("Draft saved", {
      description: "You can pick this up later from the SKU list.",
    });
  };

  const resetAll = () => {
    for (const img of images) URL.revokeObjectURL(img.url);
    setImages([]);
    setLogLines([]);
    setPerImageResults([]);
    setQueriedSources([]);
    setAiResponse(null);
    setSelectedMatchId(null);
    setFormValues(emptyFormValues());
    setEditedFields(new Set());
    setManualFallback(false);
    setStep("upload");
  };

  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/products/my-sku" className="hover:text-gray-900">
              SKU Master
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700">Create SKU with AI</span>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 text-white flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Create SKU with AI
                  </h1>
                  {realAi ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE — Claude Opus 4.7
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                      DEMO MODE — mock data
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {realAi
                    ? "Upload product images — Claude Vision identifies the SKU and pre-fills the catalog."
                    : "Live AI is off. Set VITE_ANTHROPIC_API_KEY in .env.local to enable real product identification."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {step !== "upload" && (
                <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Start Over
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/products/my-sku")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to SKU Master
              </Button>
            </div>
          </div>

          <Stepper current={step} />
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-w-6xl mx-auto">
        {step === "upload" && (
          <UploadStep
            images={images}
            dragOver={dragOver}
            fileInputRef={fileInputRef}
            onPick={onPick}
            onDrop={onDrop}
            setDragOver={setDragOver}
            removeImage={removeImage}
            onContinue={runAiPipeline}
          />
        )}
        {step === "processing" && (
          <ProcessingStep
            images={images}
            progress={progress}
            logLines={logLines}
            perImageResults={perImageResults}
            queriedSources={queriedSources}
          />
        )}
        {step === "matches" && aiResponse && (
          <MatchesStep
            response={aiResponse}
            onSelect={selectMatch}
            onManualFallback={startManual}
            onRetry={runAiPipeline}
          />
        )}
        {step === "preview" && (
          <PreviewStep
            uploadedImages={images}
            match={selectedMatch ?? null}
            manualFallback={manualFallback}
            perImageResults={perImageResults}
            formValues={formValues}
            editedFields={editedFields}
            setField={setField}
            missingMandatory={missingMandatory as (keyof FormValues)[]}
            onBack={() => (selectedMatch ? setStep("matches") : setStep("upload"))}
            onCreate={handleCreate}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({ current }: { current: Step }) {
  const order: Step[] = ["upload", "processing", "matches", "preview"];
  const labels: Record<Step, string> = {
    upload: "Upload Images",
    processing: "AI Processing",
    matches: "Select Match",
    preview: "Preview & Create",
  };
  const currentIdx = order.indexOf(current);
  return (
    <div className="mt-4 flex items-center gap-2 overflow-x-auto">
      {order.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
                done && "bg-emerald-50 text-emerald-700 border-emerald-200",
                active && "bg-blue-50 text-blue-700 border-blue-200",
                !done && !active && "bg-gray-50 text-gray-500 border-gray-200",
              )}
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px]",
                  done && "bg-emerald-600 text-white",
                  active && "bg-blue-600 text-white",
                  !done && !active && "bg-gray-200 text-gray-600",
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {labels[s]}
            </div>
            {i < order.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Upload
// ---------------------------------------------------------------------------

interface UploadStepProps {
  images: UploadedImage[];
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  setDragOver: (b: boolean) => void;
  removeImage: (id: string) => void;
  onContinue: () => void;
}

function UploadStep(props: UploadStepProps) {
  const { images, dragOver, fileInputRef, onPick, onDrop, setDragOver, removeImage, onContinue } =
    props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Drop zone */}
      <Card className="lg:col-span-2 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Upload product images
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          1 to {MAX_IMAGES} images. JPG, PNG, or WEBP, up to 8 MB each. The clearer the
          label, the better the AI match.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-colors p-8",
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50/40 hover:border-blue-400",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="hidden"
            onChange={onPick}
          />
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Drag & drop product images here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or use the buttons below — minimum 1, maximum {MAX_IMAGES} images
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Choose files
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const el = document.createElement("input");
                  el.type = "file";
                  el.accept = "image/*";
                  // @ts-expect-error — non-standard hint for mobile camera.
                  el.capture = "environment";
                  el.onchange = () => {
                    if (el.files) {
                      const list = el.files;
                      const evt = { target: { files: list, value: "" } } as unknown as ChangeEvent<HTMLInputElement>;
                      onPick(evt);
                    }
                  };
                  el.click();
                }}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Use camera
              </Button>
            </div>
          </div>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-700">
                {images.length} of {MAX_IMAGES} images added
              </p>
              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add another
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg border border-gray-200 overflow-hidden bg-white"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-gray-700 truncate">
                      {img.label}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{img.file.name}</p>
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={onContinue}
            disabled={images.length === 0}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Identify with AI
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-b from-blue-50 to-white border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Recommended images</h3>
        </div>
        <ul className="space-y-2 text-xs text-gray-700">
          {RECOMMENDED_LABELS.map((label) => (
            <li key={label} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {label}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-xs font-semibold text-gray-900 mb-2">
            The AI looks for
          </p>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <ScanBarcode className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
              Barcode (EAN-13 / UPC-A)
            </li>
            <li className="flex items-start gap-2">
              <Search className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
              OCR text — pack size, ingredients, MRP
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
              Brand logo + label colour
            </li>
          </ul>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-[11px] text-gray-500">
            Powered by OCR + vision search across Amazon, Flipkart, JioMart,
            BigBasket, Blinkit, and brand catalogs.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Processing
// ---------------------------------------------------------------------------

interface ProcessingStepProps {
  images: UploadedImage[];
  progress: number;
  logLines: string[];
  perImageResults: ImageProcessingResult[];
  queriedSources: AiSearchSource[];
}

function ProcessingStep({
  images,
  progress,
  logLines,
  perImageResults,
  queriedSources,
}: ProcessingStepProps) {
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logLines]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <h2 className="text-base font-semibold text-gray-900">
            AI is identifying the product
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Running OCR, barcode detection, and cross-checking marketplaces. This usually
          takes a few seconds.
        </p>

        <Progress value={progress} className="h-2 mb-4" />

        <div
          ref={logRef}
          className="rounded-lg bg-gray-900 text-gray-100 font-mono text-xs p-4 h-64 overflow-y-auto"
        >
          {logLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              <span className="text-gray-500">[{(i + 1).toString().padStart(2, "0")}]</span>{" "}
              {line}
            </div>
          ))}
          {logLines.length === 0 && (
            <div className="text-gray-500">Initialising…</div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Sources queried</p>
          <div className="flex flex-wrap gap-1.5">
            {queriedSources.length === 0 ? (
              <span className="text-xs text-gray-500">Waiting on OCR…</span>
            ) : (
              queriedSources.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-[11px]"
                >
                  {s}
                </Badge>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Per-image extraction</h3>
        <div className="space-y-3">
          {images.map((img, idx) => {
            const result = perImageResults[idx];
            return (
              <div
                key={img.id}
                className="flex gap-3 p-2 rounded-lg border border-gray-200 bg-white"
              >
                <div className="w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {img.label}
                  </p>
                  {result ? (
                    <>
                      <p className="text-[11px] text-gray-600 mt-0.5 truncate">
                        Brand: {result.brandDetected ?? "—"}
                      </p>
                      <p className="text-[11px] text-gray-600 truncate">
                        Barcode: {result.barcodeDetected ?? "not found"}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">
                      processing…
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Matches
// ---------------------------------------------------------------------------

interface MatchesStepProps {
  response: AiSearchResponse;
  onSelect: (matchId: string) => void;
  onManualFallback: () => void;
  onRetry: () => void;
}

function MatchesStep({ response, onSelect, onManualFallback, onRetry }: MatchesStepProps) {
  if (response.noConfidentMatch) {
    return (
      <Card className="p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          No confident match found
        </h2>
        <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
          We extracted what we could from the labels but couldn't pin this to a known
          product. Please complete the SKU manually — your OCR text is pre-filled.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry Search
          </Button>
          <Button onClick={onManualFallback} className="gap-2">
            Continue manually
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-emerald-50/40 border-emerald-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-900">
              {response.matches.length} candidate match
              {response.matches.length === 1 ? "" : "es"} found
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Searched {response.searchedSources.length} sources. Pick the best match —
              you can edit any field on the next screen.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {response.matches.map((match, idx) => (
          <MatchCard
            key={match.matchId}
            match={match}
            primary={idx === 0}
            onSelect={() => onSelect(match.matchId)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry Search
        </Button>
        <Button variant="ghost" onClick={onManualFallback} className="gap-2 text-gray-600">
          None of these — start manually
        </Button>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  primary,
  onSelect,
}: {
  match: AiProductMatch;
  primary: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-shadow hover:shadow-md",
        primary && "ring-2 ring-blue-500 ring-offset-1",
      )}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <AiThumbnail seed={match.thumbnailSeed} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {match.productName.value.toLowerCase().startsWith(match.brandName.value.toLowerCase())
                  ? match.productName.value
                  : `${match.brandName.value} — ${match.productName.value}`}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {match.packSize.value} {match.uom.value} · {match.category.value}
              </p>
            </div>
            <TierBadge tier={match.tier} score={match.overallConfidence} />
          </div>

          <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">
            {match.matchReason}
          </p>

          <div className="flex flex-wrap gap-1 mt-2">
            {match.sources.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-[11px] text-gray-500">
              MRP ₹{match.mrp.value} · HSN {match.hsnCode.value} · GST {match.gstPercent.value}%
            </div>
            <Button size="sm" onClick={onSelect} className="gap-1">
              Use this
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TierBadge({ tier, score }: { tier: MatchTier; score: number }) {
  const styles: Record<MatchTier, string> = {
    exact: "bg-emerald-100 text-emerald-800 border-emerald-300",
    high: "bg-blue-100 text-blue-800 border-blue-300",
    partial: "bg-amber-100 text-amber-800 border-amber-300",
  };
  const label: Record<MatchTier, string> = {
    exact: "Exact Match",
    high: "High Confidence",
    partial: "Partial Match",
  };
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-0.5 px-2 py-1 rounded-md border text-[10px] font-semibold shrink-0",
        styles[tier],
      )}
    >
      <span>{label[tier]}</span>
      <span className="text-[10px] opacity-80">{score}% match</span>
    </div>
  );
}

function AiThumbnail({
  seed,
  size = "md",
  label,
}: {
  seed: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const { from, to, initials } = thumbnailColorFor(seed);
  const sizes = {
    sm: "w-12 h-12 text-[10px]",
    md: "w-16 h-16 text-xs",
    lg: "w-20 h-20 text-sm",
  };
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br flex flex-col items-center justify-center text-white shrink-0 font-semibold shadow-inner",
        from,
        to,
        sizes[size],
      )}
      title={label ?? seed}
    >
      <span>{initials || "AI"}</span>
      {label && size !== "sm" && (
        <span className="text-[9px] mt-0.5 opacity-90 font-normal">{label}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Preview / Edit
// ---------------------------------------------------------------------------

interface PreviewStepProps {
  uploadedImages: UploadedImage[];
  match: AiProductMatch | null;
  manualFallback: boolean;
  perImageResults: ImageProcessingResult[];
  formValues: FormValues;
  editedFields: Set<keyof FormValues>;
  setField: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  missingMandatory: (keyof FormValues)[];
  onBack: () => void;
  onCreate: () => void;
  onSaveDraft: () => void;
}

function PreviewStep(props: PreviewStepProps) {
  const {
    uploadedImages,
    match,
    manualFallback,
    perImageResults,
    formValues,
    editedFields,
    setField,
    missingMandatory,
    onBack,
    onCreate,
    onSaveDraft,
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main form */}
      <div className="lg:col-span-2 space-y-4">
        {manualFallback && (
          <Card className="p-3 bg-amber-50/60 border-amber-200">
            <div className="flex items-start gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-900">
                No confident match. We've pre-filled what we could extract from the
                labels — please complete the rest manually.
              </p>
            </div>
          </Card>
        )}
        {match && (
          <Card className="p-3 bg-blue-50/60 border-blue-200">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-900">
                Pre-filled from{" "}
                <strong>
                  {match.productName.value.toLowerCase().startsWith(match.brandName.value.toLowerCase())
                    ? match.productName.value
                    : `${match.brandName.value} ${match.productName.value}`}
                </strong>{" "}
                ({match.overallConfidence}% match). Edit any field — your edits override
                the AI suggestion.
              </p>
            </div>
          </Card>
        )}

        <FormSection title="Identity">
          <FieldRow
            label="Brand Name"
            required
            confidence={fieldConfidence("brandName", match)}
            edited={editedFields.has("brandName")}
            missing={missingMandatory.includes("brandName")}
          >
            <Input
              value={formValues.brandName}
              onChange={(e) => setField("brandName", e.target.value)}
              placeholder="e.g. Amul"
            />
          </FieldRow>
          <FieldRow
            label="Product Name"
            required
            confidence={fieldConfidence("productName", match)}
            edited={editedFields.has("productName")}
            missing={missingMandatory.includes("productName")}
          >
            <Input
              value={formValues.productName}
              onChange={(e) => setField("productName", e.target.value)}
              placeholder="e.g. Gold Full Cream Milk"
            />
          </FieldRow>
          <FieldRow
            label="Variant"
            confidence={fieldConfidence("variant", match)}
            edited={editedFields.has("variant")}
          >
            <Input
              value={formValues.variant}
              onChange={(e) => setField("variant", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="Flavor"
            confidence={fieldConfidence("flavor", match)}
            edited={editedFields.has("flavor")}
          >
            <Input
              value={formValues.flavor}
              onChange={(e) => setField("flavor", e.target.value)}
            />
          </FieldRow>
        </FormSection>

        <FormSection title="Taxonomy">
          <FieldRow
            label="Category"
            required
            confidence={fieldConfidence("category", match)}
            edited={editedFields.has("category")}
            missing={missingMandatory.includes("category")}
          >
            <Input
              value={formValues.category}
              onChange={(e) => setField("category", e.target.value)}
              placeholder="e.g. Food & Groceries"
            />
          </FieldRow>
          <FieldRow
            label="Sub-category"
            required
            confidence={fieldConfidence("subCategory", match)}
            edited={editedFields.has("subCategory")}
            missing={missingMandatory.includes("subCategory")}
          >
            <Input
              value={formValues.subCategory}
              onChange={(e) => setField("subCategory", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="SKU Type"
            confidence={fieldConfidence("skuType", match)}
            edited={editedFields.has("skuType")}
          >
            <Input
              value={formValues.skuType}
              onChange={(e) => setField("skuType", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="Package Type"
            confidence={fieldConfidence("packageType", match)}
            edited={editedFields.has("packageType")}
          >
            <Input
              value={formValues.packageType}
              onChange={(e) => setField("packageType", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="Tags (comma separated)"
            confidence={fieldConfidence("tags", match)}
            edited={editedFields.has("tags")}
          >
            <Input
              value={formValues.tags}
              onChange={(e) => setField("tags", e.target.value)}
              placeholder="e.g. Dairy, Milk, Tetra Pack"
            />
          </FieldRow>
          <FieldRow
            label="Search Keywords (comma separated)"
            confidence={fieldConfidence("searchKeywords", match)}
            edited={editedFields.has("searchKeywords")}
          >
            <Input
              value={formValues.searchKeywords}
              onChange={(e) => setField("searchKeywords", e.target.value)}
            />
          </FieldRow>
        </FormSection>

        <FormSection title="Description">
          <FieldRow
            label="Product Description"
            confidence={fieldConfidence("description", match)}
            edited={editedFields.has("description")}
            stack
          >
            <Textarea
              value={formValues.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              placeholder="AI-generated marketing copy — edit as needed."
            />
          </FieldRow>
          {(match?.ingredients || formValues.ingredients) && (
            <FieldRow
              label="Ingredients"
              confidence={fieldConfidence("ingredients", match)}
              edited={editedFields.has("ingredients")}
              stack
            >
              <Textarea
                value={formValues.ingredients}
                onChange={(e) => setField("ingredients", e.target.value)}
                rows={2}
              />
            </FieldRow>
          )}
          {match?.nutrition && (
            <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-700">
                  Nutrition (per 100 g/ml) — from AI
                </p>
                <ConfidenceDot level={match.nutrition.confidence} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {match.nutrition.value.map((row: NutritionRow) => (
                  <div
                    key={row.label}
                    className="flex justify-between px-2 py-1 bg-white rounded border border-gray-200"
                  >
                    <span className="text-gray-600">{row.label}</span>
                    <span className="font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title="Pack & Measurements">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow
              label="Pack Size"
              required
              confidence={fieldConfidence("packSize", match)}
              edited={editedFields.has("packSize")}
              missing={missingMandatory.includes("packSize")}
            >
              <Input
                value={formValues.packSize}
                onChange={(e) => setField("packSize", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="UOM"
              required
              confidence={fieldConfidence("uom", match)}
              edited={editedFields.has("uom")}
              missing={missingMandatory.includes("uom")}
            >
              <Input
                value={formValues.uom}
                onChange={(e) => setField("uom", e.target.value)}
                placeholder="g / ml / kg / L"
              />
            </FieldRow>
            <FieldRow
              label="Net Weight"
              confidence={fieldConfidence("netWeight", match)}
              edited={editedFields.has("netWeight")}
            >
              <Input
                value={formValues.netWeight}
                onChange={(e) => setField("netWeight", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Gross Weight"
              confidence={fieldConfidence("grossWeight", match)}
              edited={editedFields.has("grossWeight")}
            >
              <Input
                value={formValues.grossWeight}
                onChange={(e) => setField("grossWeight", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Dimensions (L × W × H)"
              confidence={fieldConfidence("dimensions", match)}
              edited={editedFields.has("dimensions")}
            >
              <Input
                value={formValues.dimensions}
                onChange={(e) => setField("dimensions", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Case Pack"
              confidence={fieldConfidence("casePack", match)}
              edited={editedFields.has("casePack")}
            >
              <Input
                value={formValues.casePack}
                onChange={(e) => setField("casePack", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Inner Pack"
              confidence={fieldConfidence("innerPack", match)}
              edited={editedFields.has("innerPack")}
            >
              <Input
                value={formValues.innerPack}
                onChange={(e) => setField("innerPack", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Multipack"
              confidence={fieldConfidence("multipack", match)}
              edited={editedFields.has("multipack")}
            >
              <Input
                value={formValues.multipack}
                onChange={(e) => setField("multipack", e.target.value)}
              />
            </FieldRow>
          </div>
        </FormSection>

        <FormSection title="Compliance & Pricing">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow
              label="Barcode (EAN / UPC)"
              required
              confidence={fieldConfidence("barcode", match)}
              edited={editedFields.has("barcode")}
              missing={missingMandatory.includes("barcode")}
            >
              <Input
                value={formValues.barcode}
                onChange={(e) => setField("barcode", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="HSN Code"
              required
              confidence={fieldConfidence("hsnCode", match)}
              edited={editedFields.has("hsnCode")}
              missing={missingMandatory.includes("hsnCode")}
            >
              <Input
                value={formValues.hsnCode}
                onChange={(e) => setField("hsnCode", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="GST %"
              required
              confidence={fieldConfidence("gstPercent", match)}
              edited={editedFields.has("gstPercent")}
              missing={missingMandatory.includes("gstPercent")}
            >
              <Input
                value={formValues.gstPercent}
                onChange={(e) => setField("gstPercent", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="MRP (₹)"
              required
              confidence={fieldConfidence("mrp", match)}
              edited={editedFields.has("mrp")}
              missing={missingMandatory.includes("mrp")}
            >
              <Input
                value={formValues.mrp}
                onChange={(e) => setField("mrp", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Manufacturer Name"
              confidence={fieldConfidence("manufacturerName", match)}
              edited={editedFields.has("manufacturerName")}
            >
              <Input
                value={formValues.manufacturerName}
                onChange={(e) => setField("manufacturerName", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Country of Origin"
              confidence={fieldConfidence("countryOfOrigin", match)}
              edited={editedFields.has("countryOfOrigin")}
            >
              <Input
                value={formValues.countryOfOrigin}
                onChange={(e) => setField("countryOfOrigin", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Shelf Life (days)"
              confidence={fieldConfidence("shelfLifeDays", match)}
              edited={editedFields.has("shelfLifeDays")}
            >
              <Input
                value={formValues.shelfLifeDays}
                onChange={(e) => setField("shelfLifeDays", e.target.value)}
              />
            </FieldRow>
            <FieldRow
              label="Storage Type"
              confidence={fieldConfidence("storageType", match)}
              edited={editedFields.has("storageType")}
            >
              <Input
                value={formValues.storageType}
                onChange={(e) => setField("storageType", e.target.value)}
              />
            </FieldRow>
          </div>
        </FormSection>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {missingMandatory.length > 0 && (
              <span className="text-xs text-amber-700 flex items-center gap-1">
                <TriangleAlert className="h-3.5 w-3.5" />
                {missingMandatory.length} mandatory field
                {missingMandatory.length === 1 ? "" : "s"} missing
              </span>
            )}
            <Button variant="outline" onClick={onSaveDraft} className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={onCreate} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Create SKU
            </Button>
          </div>
        </div>
      </div>

      {/* Side panel — images + summary */}
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Uploaded images</h3>
          <div className="grid grid-cols-2 gap-2">
            {uploadedImages.map((img) => (
              <div key={img.id} className="aspect-square rounded overflow-hidden border border-gray-200 bg-gray-100">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Card>

        {match && match.fetchedImages.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Suggested product images
            </h3>
            <p className="text-[11px] text-gray-500 mb-3">From the matched catalog</p>
            <div className="grid grid-cols-2 gap-2">
              {match.fetchedImages.map((m) => (
                <div key={m.seed} className="aspect-square rounded overflow-hidden border border-gray-200">
                  <AiThumbnail seed={m.seed} size="lg" label={m.label} />
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Confidence summary</h3>
          {match ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Overall</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  {match.overallConfidence}%
                </Badge>
              </div>
              <Progress value={match.overallConfidence} className="h-2 mb-3" />
              <div className="space-y-1.5 text-xs">
                <ConfidenceLegend />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">Manual entry — no AI confidence score.</p>
          )}
        </Card>

        {match && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Audit trail</h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>
                <span className="text-gray-400">Source:</span> AI Generated
              </li>
              <li>
                <span className="text-gray-400">Match score:</span>{" "}
                {match.overallConfidence}%
              </li>
              <li>
                <span className="text-gray-400">Images:</span>{" "}
                {uploadedImages.length} uploaded
              </li>
              <li>
                <span className="text-gray-400">Sources cross-checked:</span>{" "}
                {match.sources.length}
              </li>
              <li>
                <span className="text-gray-400">User edits:</span>{" "}
                {editedFields.size > 0
                  ? `${editedFields.size} field${editedFields.size === 1 ? "" : "s"}`
                  : "none"}
              </li>
              {perImageResults.some((r) => r.barcodeDetected) && (
                <li>
                  <span className="text-gray-400">Barcodes parsed:</span>{" "}
                  {perImageResults.filter((r) => r.barcodeDetected).length}
                </li>
              )}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

interface FieldRowProps {
  label: string;
  required?: boolean;
  confidence?: ConfidenceLevel | null;
  edited?: boolean;
  missing?: boolean;
  stack?: boolean;
  children: React.ReactNode;
}

function FieldRow({
  label,
  required,
  confidence,
  edited,
  missing,
  stack,
  children,
}: FieldRowProps) {
  return (
    <div className={cn(stack ? "space-y-1.5" : "space-y-1")}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          {edited && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-600 border-gray-200 text-[9px] px-1.5 py-0"
            >
              edited
            </Badge>
          )}
          {confidence && <ConfidenceDot level={confidence} />}
          {missing && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px] px-1.5 py-0">
              Needs User Input
            </Badge>
          )}
        </div>
      </div>
      <div
        className={cn(
          missing && "[&_input]:border-red-300 [&_input]:bg-red-50/30",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ConfidenceDot({ level }: { level: ConfidenceLevel }) {
  const colors: Record<ConfidenceLevel, string> = {
    high: "bg-emerald-500",
    medium: "bg-amber-500",
    low: "bg-red-500",
  };
  const tooltip: Record<ConfidenceLevel, string> = {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence — please verify",
  };
  return (
    <span
      title={tooltip[level]}
      className="inline-flex items-center gap-1 text-[10px] text-gray-500"
    >
      <span className={cn("h-2 w-2 rounded-full", colors[level])} />
    </span>
  );
}

function ConfidenceLegend() {
  return (
    <>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> High — verified across
        multiple sources
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium — single-source
        match
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="h-2 w-2 rounded-full bg-red-500" /> Low — please verify
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Form value plumbing
// ---------------------------------------------------------------------------

interface FormValues {
  brandName: string;
  productName: string;
  variant: string;
  flavor: string;
  category: string;
  subCategory: string;
  skuType: string;
  packageType: string;
  tags: string;
  searchKeywords: string;
  description: string;
  ingredients: string;
  packSize: string;
  uom: string;
  netWeight: string;
  grossWeight: string;
  dimensions: string;
  casePack: string;
  innerPack: string;
  multipack: string;
  barcode: string;
  hsnCode: string;
  gstPercent: string;
  manufacturerName: string;
  countryOfOrigin: string;
  shelfLifeDays: string;
  storageType: string;
  mrp: string;
}

function emptyFormValues(): FormValues {
  return {
    brandName: "",
    productName: "",
    variant: "",
    flavor: "",
    category: "",
    subCategory: "",
    skuType: "",
    packageType: "",
    tags: "",
    searchKeywords: "",
    description: "",
    ingredients: "",
    packSize: "",
    uom: "",
    netWeight: "",
    grossWeight: "",
    dimensions: "",
    casePack: "",
    innerPack: "",
    multipack: "",
    barcode: "",
    hsnCode: "",
    gstPercent: "",
    manufacturerName: "",
    countryOfOrigin: "",
    shelfLifeDays: "",
    storageType: "",
    mrp: "",
  };
}

function matchToFormValues(match: AiProductMatch): FormValues {
  const v = (f?: AiField | AiField<string[]>): string => {
    if (!f) return "";
    if (Array.isArray(f.value)) return (f.value as string[]).join(", ");
    return String(f.value);
  };
  return {
    brandName: v(match.brandName),
    productName: v(match.productName),
    variant: v(match.variant),
    flavor: v(match.flavor),
    category: v(match.category),
    subCategory: v(match.subCategory),
    skuType: v(match.skuType),
    packageType: v(match.packageType),
    tags: v(match.tags),
    searchKeywords: v(match.searchKeywords),
    description: v(match.description),
    ingredients: match.ingredients ? (match.ingredients.value as string[]).join(", ") : "",
    packSize: v(match.packSize),
    uom: v(match.uom),
    netWeight: v(match.netWeight),
    grossWeight: v(match.grossWeight),
    dimensions: v(match.dimensions),
    casePack: v(match.casePack),
    innerPack: v(match.innerPack),
    multipack: v(match.multipack),
    barcode: v(match.barcode),
    hsnCode: v(match.hsnCode),
    gstPercent: v(match.gstPercent),
    manufacturerName: v(match.manufacturerName),
    countryOfOrigin: v(match.countryOfOrigin),
    shelfLifeDays: v(match.shelfLifeDays),
    storageType: v(match.storageType),
    mrp: v(match.mrp),
  };
}

function ocrToFormValues(results: ImageProcessingResult[]): FormValues {
  const fv = emptyFormValues();
  const firstBrand = results.find((r) => r.brandDetected)?.brandDetected;
  const firstBarcode = results.find((r) => r.barcodeDetected)?.barcodeDetected;
  if (firstBrand) fv.brandName = firstBrand;
  if (firstBarcode) fv.barcode = firstBarcode;
  // Best-effort name guess from OCR — first non-brand line.
  const guess = results
    .flatMap((r) => r.ocrText)
    .find((line) => firstBrand && line.toLowerCase() !== firstBrand.toLowerCase());
  if (guess) fv.productName = guess;
  return fv;
}

function fieldConfidence(
  key: keyof AiProductMatch,
  match: AiProductMatch | null,
): ConfidenceLevel | null {
  if (!match) return null;
  const field = match[key] as AiField | AiField<string[]> | undefined;
  if (!field || typeof field !== "object" || !("confidence" in field)) return null;
  return field.confidence;
}

// Force a one-line reference so unused imports don't trigger lint noise.
// (kept exports tree-shakeable; we reference Eye to satisfy TS in case a
// future iteration adds an inline-preview button.)
const __unused = { Eye, FIELD_LABELS };
void __unused;
