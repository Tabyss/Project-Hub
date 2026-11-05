import { useState, useRef } from "react";
import api from "../services/api";

export const useMedia = () => {
  const [isUploading, setIsUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const uploadSingleImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const { data } = await api.post("/upload/", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.url;
    } catch (error) {
      alert("Failed to upload image.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    coverInputRef,
    galleryInputRef,
    uploadSingleImage,
  };
};