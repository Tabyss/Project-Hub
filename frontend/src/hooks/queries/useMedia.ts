import { useState, useRef } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const useMedia = () => {
  const [isUploading, setIsUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, openLoginModal } = useAuth();

  const uploadSingleImage = async (file: File): Promise<string | null> => {
    if (!isAuthenticated) {
      openLoginModal();
      return null;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const { data } = await api.post("/upload/", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.url;
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Gagal mengunggah gambar.";
      alert(msg);
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