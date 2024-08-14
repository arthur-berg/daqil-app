"use client";

import axios, { AxiosProgressEvent, CancelTokenSource } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "../dropzone/react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPreSignedUrl } from "./_actions/getPreSignedUrl";
import { FileUploadProgress, FileStatus } from "./types";
import { generateThumbnails, getFileUrl, revokeThumbnails } from "./fileUtils";
import FileCard from "./file-card";
import { MdBackup } from "react-icons/md";

interface DropzoneComponentProps {
  maxTotalFiles: number;
  maxSize: number;
  acceptedFileTypes: {
    [key: string]: string[];
  };
  filesToUpload: FileUploadProgress[];
  setFilesToUpload: React.Dispatch<React.SetStateAction<FileUploadProgress[]>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  dirInBucket: string | null;
  successCallback?: (uploadedFileUrl: string) => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  maxTotalFiles,
  maxSize,
  acceptedFileTypes,
  filesToUpload,
  setFilesToUpload,
  errorMessage,
  setErrorMessage,
  dirInBucket,
  successCallback,
}) => {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    const newThumbnails = generateThumbnails(filesToUpload.map((f) => f.file));
    setThumbnails(newThumbnails);

    return () => {
      revokeThumbnails(newThumbnails);
    };
  }, [filesToUpload]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrorMessage("");
      if (
        !maxTotalFiles ||
        filesToUpload.length + acceptedFiles.length > maxTotalFiles
      ) {
        setErrorMessage(
          `You can only upload a maximum of ${maxTotalFiles} files.`
        );
        return;
      }
      const fileUploadBatch = acceptedFiles.map(async (file) => {
        try {
          const presignedUrlResponse = await getPreSignedUrl(
            file.name,
            file.type,
            dirInBucket
          );
          const { url, newFileName, bucketUrl, region } = presignedUrlResponse;

          const fileKey = dirInBucket
            ? `${dirInBucket}/${newFileName}`
            : newFileName;

          const s3FileUrl = `https://${bucketUrl}.s3.${region}.amazonaws.com/${fileKey}`;

          const source = axios.CancelToken.source();
          setFilesToUpload((prev) => [
            ...prev,
            { progress: 0, file, source, status: FileStatus.Uploading },
          ]);

          await axios.put(url, file, {
            headers: { "Content-Type": file.type },
            cancelToken: source.token,
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / (progressEvent.total ?? 1)) * 100
              );
              setFilesToUpload((prevUploadProgress) =>
                prevUploadProgress.map((item) =>
                  item.file.name === file.name
                    ? {
                        ...item,
                        progress,
                        source,
                        status: FileStatus.Uploading,
                      }
                    : item
                )
              );
            },
          });

          // After successful upload
          setFilesToUpload((prevUploadProgress) =>
            prevUploadProgress.map((item) =>
              item.file.name === file.name
                ? { ...item, status: FileStatus.Uploaded, newFileName }
                : item
            )
          );

          // Invoke successCallback with the accessible file URL
          if (typeof successCallback === "function") {
            successCallback(s3FileUrl);
          }
        } catch (error) {
          console.error("Error uploading file:", file.name, error);
          setFilesToUpload((prevUploadProgress) =>
            prevUploadProgress.map((item) =>
              item.file.name === file.name
                ? { ...item, status: FileStatus.Error, error: error }
                : item
            )
          );
        }
      });

      try {
        await Promise.all(fileUploadBatch);
      } catch (error) {
        console.error("Error uploading files:", error);
      }
      setErrorMessage("");
    },
    [
      filesToUpload,
      maxTotalFiles,
      dirInBucket,
      setFilesToUpload,
      setErrorMessage,
      successCallback,
    ]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxSize,
  });

  const removeFile = (file: File) => {
    setFilesToUpload((prev) =>
      prev.filter((item) => item.file.name !== file.name)
    );
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      {filesToUpload.length < maxTotalFiles && (
        <div
          className="flex flex-col items-center justify-center p-4 md:p-8 border border-gray-200 rounded-lg shadow-md bg-gray-100 hover:bg-gray-200 transition duration-300"
          {...getRootProps()}
        >
          <div className="flex flex-col items-center justify-center space-y-2 md:space-y-4">
            <MdBackup size={24} className="text-gray-500 md:text-xl" />
            <p className="text-base md:text-lg font-semibold text-gray-800">
              Drag & Drop Files Here
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              or click to browse
            </p>
          </div>
          <Input {...getInputProps()} className="hidden" />
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 md:mt-4 text-xs md:text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {filesToUpload.length > 0 && (
        <div className="mt-4 w-full">
          <ScrollArea className="max-h-64 md:max-h-96 overflow-y-auto">
            <div
              className={`grid ${
                filesToUpload.length === 1
                  ? "justify-center grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              } gap-2 md:gap-4`}
            >
              {filesToUpload.map((fileUploadProgress, index) => (
                <FileCard
                  getFileUrl={getFileUrl}
                  key={index}
                  fileUploadProgress={fileUploadProgress}
                  thumbnails={thumbnails}
                  removeFile={removeFile}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default DropzoneComponent;
