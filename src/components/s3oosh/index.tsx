"use client";

import { CancelTokenSource } from "axios";
import { useState } from "react";
import DropzoneComponent from "./dropzone";

enum FileStatus {
  Uploading = "uploading",
  Uploaded = "uploaded",
  Error = "error",
}

interface FileUploadProgress {
  error?: Error | undefined | unknown | null;
  progress: number;
  file: File;
  source: CancelTokenSource | null;
  status: FileStatus;
  newFileName?: string;
}

export interface S3ooshConfig {
  maxTotalFiles: number;
  maxSize: number;
  successCallback?: (uploadedFileUrl: string) => void;
  acceptedFileTypes: {
    [key: string]: string[];
  };
}

interface S3ooshProps {
  config: S3ooshConfig;
  dirInBucket?: string | null;
}

export default function S3oosh({ config, dirInBucket = null }: S3ooshProps) {
  const { maxTotalFiles, maxSize, acceptedFileTypes, successCallback } = config;
  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  return (
    <DropzoneComponent
      maxTotalFiles={maxTotalFiles}
      maxSize={maxSize}
      acceptedFileTypes={acceptedFileTypes}
      filesToUpload={filesToUpload}
      setFilesToUpload={setFilesToUpload}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      dirInBucket={dirInBucket}
      successCallback={successCallback}
    />
  );
}
