import multer from "multer";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "./async.middleware.js";

/* -----------------------------
   🧩  Ensure upload directory
----------------------------- */
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/* -----------------------------
   📁 File type map
----------------------------- */
const fileTypeMap = {
  image: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

/* -----------------------------
   ☁️ Upload to IMGBB
----------------------------- */
const uploadToImgbb = async (buffer) => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new ApiError(500, "Missing IMGBB_API_KEY in environment");
  if (!buffer) throw new ApiError(400, "No image buffer provided");

  const imageBase64 = buffer.toString("base64");
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: new URLSearchParams({ image: imageBase64 }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new ApiError(500, data.error?.message || "Upload to IMGBB failed");
  }

  return {
    url: data.data.url,
    deleteUrl: data.data.delete_url,
    id: data.data.id,
  };
};

/* -----------------------------
   ❌ Delete from IMGBB
----------------------------- */
const deleteFromImgbb = async (deleteUrl) => {
  if (!deleteUrl) return;
  try {
    await fetch(deleteUrl, { method: "GET" });
  } catch (err) {
    console.warn("⚠️ Failed to delete from IMGBB:", err.message);
  }
};

/* -----------------------------
   💾 Multer storage (local for non-images)
----------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = `uploads/${req.uploadFolder || "misc"}`;
    ensureDirExists(baseDir);
    cb(null, baseDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

/* -----------------------------
   🔍 File filter
----------------------------- */
const fileFilter = (fields) => (req, file, cb) => {
  const fieldConfig = fields.find((f) => f.name === file.fieldname);
  if (!fieldConfig) {
    return cb(
      new ApiError(400, `Invalid field name: ${file.fieldname}`),
      false
    );
  }

  const allowedMimes = fileTypeMap[fieldConfig.type] || [];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type for ${file.fieldname}. Allowed: ${allowedMimes.join(
          ", "
        )}`
      ),
      false
    );
  }
};

/* -----------------------------
   🧩 Reusable uploader
----------------------------- */
export const useUpload = ({ folder = "misc", fields = [] }) => {
  const upload = multer({
    storage,
    fileFilter: fileFilter(fields),
  });

  // Middleware wrapper for IMGBB image handling
  return asyncHandler(async (req, res, next) => {
    req.uploadFolder = folder;

    // Execute multer upload first
    await new Promise((resolve, reject) =>
      upload.fields(fields)(req, res, (err) => (err ? reject(err) : resolve()))
    );

    // Upload image buffers to IMGBB
    for (const field of fields) {
      if (field.type === "image" && req.files?.[field.name]) {
        const uploadedImages = [];
        for (const file of req.files[field.name]) {
          const buffer = fs.readFileSync(file.path);
          const uploaded = await uploadToImgbb(buffer);
          fs.unlinkSync(file.path); // remove temp local file
          uploadedImages.push(uploaded);
        }
        req.files[field.name] = uploadedImages; // replace with imgbb URLs
      }
    }

    next();
  });
};

/* -----------------------------
   🧹 File management helpers
----------------------------- */
export const deleteFile = (filePathOrDeleteUrl) => {
  if (!filePathOrDeleteUrl) return;

  if (filePathOrDeleteUrl.startsWith("http")) {
    // hosted image → imgbb delete
    return deleteFromImgbb(filePathOrDeleteUrl);
  } else {
    // local file
    fs.unlink(filePathOrDeleteUrl, (err) => {
      if (err) console.warn("⚠️ Local file deletion failed:", err.message);
    });
  }
};

export const replaceFile = async (oldFile, newFileData) => {
  if (oldFile) await deleteFile(oldFile);
  return newFileData;
};

/* -----------------------------
   📦 Predefined Uploaders
----------------------------- */
export const uploadedImages = useUpload({
  fields: [{ name: "image", maxCount: 1, type: "image" }],
});

export const uploadResourceFile = useUpload({
  folder: "resources",
  fields: [{ name: "file", maxCount: 1, type: "pdf" }],
});
