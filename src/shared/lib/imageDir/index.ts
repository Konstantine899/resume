// src/shared/lib/imageDir/imageDir.ts barrel — shared save-to-directory
// mechanism (root handle + subdirectory create/select) plus the composed
// `saveUploadedImage` flow all three icon-upload forms consume.
// See imageDir.ts.
export {
  IMAGES_ROOT_KEY,
  ImageUploadError,
  getOrCreateSubdir,
  isAbortError,
  isDirectoryPickerSupported,
  pickImagesRoot,
  readImagesRootHandle,
  saveImageToDir,
  saveUploadedImage,
  writeImagesRootHandle,
} from './imageDir';
