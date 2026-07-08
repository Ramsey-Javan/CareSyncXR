"use client";

import { useRef, useState } from "react";

type CaptureType =
  | "medication"
  | "wound"
  | "document";

export default function PhotoCapture() {
  const [type, setType] =
    useState<CaptureType>("medication");

  const [files, setFiles] = useState<File[]>([]);

  const fileRef =
    useRef<HTMLInputElement>(null);

  const handleFiles = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(e.target.files ?? []);

    if (selectedFiles.length === 0) return;

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  return (
    <div className="space-y-4">

      <div className="grid md:grid-cols-3 gap-3">

        <button
          onClick={() =>
            setType("medication")
          }
          className={`rounded-xl border p-5 transition ${
            type === "medication"
              ? "bg-[#E1F5EE] border-[#1D9E75]"
              : "bg-white border-gray-200"
          }`}
        >
          💊
          <h3 className="font-medium mt-2">
            Medication
          </h3>
          <p className="text-xs text-gray-500">
            Bottle, label, dosage
          </p>
        </button>

        <button
          onClick={() => setType("wound")}
          className={`rounded-xl border p-5 transition ${
            type === "wound"
              ? "bg-[#E1F5EE] border-[#1D9E75]"
              : "bg-white border-gray-200"
          }`}
        >
          🩹
          <h3 className="font-medium mt-2">
            Wound / Skin
          </h3>
          <p className="text-xs text-gray-500">
            Bruise, rash, wound
          </p>
        </button>

        <button
          onClick={() =>
            setType("document")
          }
          className={`rounded-xl border p-5 transition ${
            type === "document"
              ? "bg-[#E1F5EE] border-[#1D9E75]"
              : "bg-white border-gray-200"
          }`}
        >
          📄
          <h3 className="font-medium mt-2">
            Document
          </h3>
          <p className="text-xs text-gray-500">
            Report, prescription
          </p>
        </button>

      </div>

      <div
        onClick={() =>
          fileRef.current?.click()
        }
        className="
          border-2
          border-dashed
          border-[#9FE1CB]
          rounded-xl
          p-10
          text-center
          cursor-pointer
          bg-white
        "
      >
        <div className="text-4xl mb-3">
          ☁️
        </div>

        <p className="font-medium text-[#085041]">
          Drag a photo here or tap to browse
        </p>

        <p className="text-sm text-gray-500 mt-2">
          JPG, PNG, PDF • max 10MB
        </p>

        <input
          hidden
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFiles}
        />
      </div>

      <button
        onClick={() =>
          fileRef.current?.click()
        }
        className="
          w-full
          border
          border-[#1D9E75]
          text-[#1D9E75]
          rounded-xl
          py-3
          hover:bg-[#E1F5EE]
        "
      >
        📸 Take photo with camera
      </button>

      {files.length === 0 ? (
        <p className="text-center text-sm text-gray-400">
          No photos added yet
        </p>
      ) : (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="
                border
                rounded-lg
                p-3
                text-sm
              "
            >
              📎 {file.name}
            </div>
          ))}
        </div>
      )}

      <button
        disabled={files.length === 0}
        className="
          w-full
          bg-[#1D9E75]
          text-white
          rounded-xl
          py-3
          disabled:opacity-50
        "
      >
        Attach photos to reading
      </button>

    </div>
  );
}