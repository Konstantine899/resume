// src/shared/lib/imageDir/imageDir.ts barrel — shared save-to-directory
// mechanism (root handle + subdirectory create/select). See imageDir.ts.
export {
  IMAGES_ROOT_KEY,
  getOrCreateSubdir,
  isDirectoryPickerSupported,
  pickImagesRoot,
  readImagesRootHandle,
  saveImageToDir,
  writeImagesRootHandle,
} from './imageDir';
