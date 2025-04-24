'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { ExclamationTriangleIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { base64ToImageUrl } from '@/lib/utils';

type MediaType = 'image' | 'video';

interface AnalysisResult {
  mediaType: MediaType;
  mediaUrl: string;
  count: number;
  emergency: boolean;
  videoUrl?: string; // Optional video URL that might be returned from backend
}

export default function VideoAnalysisPage() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileType, setFileType] = useState<MediaType | null>(null);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Determine if the file is an image or video
        const type: MediaType = file.type.startsWith('image/') ? 'image' : 'video';
        setFileType(type);
        handleFileUpload(file);
      }
    }
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setAnalysisResult(null);

    try {
      const toastId = toast.loading('Analyzing traffic data...');

      const mediaType: MediaType = file.type.startsWith('image/') ? 'image' : 'video';

      // Use the existing uploadImage API method for both image and video
      // Backend will need to handle the file type appropriately
      const result = await api.uploadImage(file);

      setAnalysisResult({
        mediaType,
        mediaUrl: base64ToImageUrl(result.image), // For both image and video (thumbnail for video)
        count: result.count,
        emergency: result.emergency,
        videoUrl: result.videoUrl // This may be undefined if backend doesn't support it yet
      });

      toast.success('Analysis complete!', { id: toastId });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to analyze media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold">Traffic Video Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Traffic Image/Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:bg-gray-800 ${isDragActive ? 'border-primary-500 bg-primary-500 bg-opacity-10' : 'border-gray-700'
                }`}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />

              <p className="mt-2 text-sm text-gray-300">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag and drop an image or video, or click to select"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Supported formats: JPG, PNG, MP4, MOV, AVI
              </p>

              {acceptedFiles.length > 0 && (
                <div className="mt-4 text-sm text-gray-300">
                  Selected: <span className="font-medium">{acceptedFiles[0].name}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-700 text-xs rounded-full">
                    {acceptedFiles[0].type.startsWith('image/') ? 'Image' : 'Video'}
                  </span>
                </div>
              )}

              <Button
                className="mt-4"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                disabled={acceptedFiles.length === 0 || isUploading}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (acceptedFiles.length > 0) {
                    handleFileUpload(acceptedFiles[0]);
                  }
                }}
              >
                {isUploading ? 'Analyzing...' : 'Analyze Traffic'}
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p>
                Upload traffic images or video clips to analyze vehicle counts and detect emergency vehicles.
                Analysis results will appear in real-time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results area */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isUploading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-300">Processing your upload...</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-900 relative rounded-lg overflow-hidden">
                  {analysisResult.mediaType === 'image' ? (
                    <Image
                      src={analysisResult.mediaUrl}
                      alt="Analysis result"
                      className="object-cover"
                      fill={true}
                    />
                  ) : (
                    // If backend returns a video URL, use video element
                    // Otherwise fall back to showing the thumbnail image
                    analysisResult.videoUrl ? (
                      <video
                        src={analysisResult.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        loop
                        muted
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={analysisResult.mediaUrl}
                          alt="Video analysis result thumbnail"
                          className="object-cover"
                          fill={true}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <p className="text-white">Video analyzed successfully</p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Vehicle Count</div>
                    <div className="text-2xl font-bold">{analysisResult.count}</div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Emergency Vehicles</div>
                    <div className="flex items-center">
                      {analysisResult.emergency ? (
                        <>
                          <ExclamationTriangleIcon className="h-6 w-6 text-danger-500 mr-2" />
                          <span className="text-danger-400">Detected</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-6 w-6 text-success-500 mr-2" />
                          <span className="text-success-400">None detected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Traffic Assessment</div>
                  <div className="text-sm">
                    {analysisResult.count > 30 ? (
                      <div className="text-danger-400">
                        Heavy traffic detected. Consider extending green light duration.
                      </div>
                    ) : analysisResult.count > 15 ? (
                      <div className="text-warning-400">
                        Moderate traffic detected. Standard signal timing recommended.
                      </div>
                    ) : (
                      <div className="text-success-400">
                        Light traffic detected. Consider shortening green light duration.
                      </div>
                    )}

                    {analysisResult.emergency && (
                      <div className="mt-2 text-danger-400">
                        Emergency vehicle detected! Priority routing recommended.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <div className="bg-gray-800 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-center">Upload an image or video to see traffic analysis results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-primary-400 text-xl font-bold mb-2">1. Upload</div>
              <p className="text-sm text-gray-300">
                Upload traffic video footage or images from any camera angle. The system accepts most common formats.
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-primary-400 text-xl font-bold mb-2">2. Analysis</div>
              <p className="text-sm text-gray-300">
                Our AI system uses YOLOv8 to detect and count vehicles, including emergency vehicles like ambulances.
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-primary-400 text-xl font-bold mb-2">3. Results</div>
              <p className="text-sm text-gray-300">
                View detailed analysis with vehicle counts, emergency detection, and traffic flow recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}