'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useOrgStore } from '@/store/orgStore';
import { orgsApi } from '@/lib/api/orgs.api';
import { useRequireAdmin } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/Spinner';

const MAX_SIZE_MB = 2;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export const LogoUpload: React.FC = () => {
  const router = useRouter();
  const { error } = useToast();
  const org = useOrgStore();
  const { initialized } = useRequireAdmin();

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (!initialized) return <PageLoader message="Loading…" />;

  const handleFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      error('Invalid file', 'Please upload a PNG, JPG, WebP, or SVG image.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      error('File too large', `Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file || !org.orgId) return;

    setUploading(true);
    try {
      const updated = await orgsApi.uploadLogo(org.orgId, file);
      org.updateLogoUrl(updated.logo_url);
      router.push('/setup');
    } catch (err: any) {
      error('Upload failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push('/setup');
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors',
          dragging
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 bg-gray-50 dark:bg-gray-800/50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleInputChange}
          className="sr-only"
        />

        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-green-100 dark:ring-green-900 bg-white dark:bg-gray-900">
              <img
                src={preview}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-50">
                {file?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {file ? `${(file.size / 1024).toFixed(0)} KB` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Upload icon */}
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-700 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Drop your church logo here
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                or click to browse · PNG, JPG, WebP, SVG · max {MAX_SIZE_MB} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          type="button"
          fullWidth
          size="lg"
          loading={uploading}
          disabled={!file}
          onClick={handleUpload}
        >
          Upload logo
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          size="lg"
          disabled={uploading}
          onClick={handleSkip}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};
