import {Area} from "react-easy-crop/types";
import React, {useContext} from "react";

export interface IPhotoUtils {
  photoToURL: (photo: File) => Promise<string>;
  urlToPhoto: (url: string) => Promise<File>;
  cropPhoto: (photoURL: string, cropArea: Area) => Promise<string>;
  getPhotoDimensions: (photoURL: string) => Promise<{ height: number, width: number }>,
}

class PhotoUtils implements IPhotoUtils {
  async photoToURL(photo: File) {
    return URL.createObjectURL(photo);
  }

  async urlToPhoto(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], 'profile_photo', {type: blob.type});
  }

  async cropPhoto(photoURL: string, cropArea: Area): Promise<string> {
    const image = await this.urlToImageElement(photoURL);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea;
    canvas.height = safeArea;

    // draw rotated image and store data.
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );
    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - cropArea.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - cropArea.y)
    );

    // As Base64 string
    // return canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise<string>(resolve => {
      canvas.toBlob(file => {
        resolve(URL.createObjectURL(file));
      }, 'image/png');
    });
  }

  async getPhotoDimensions(photoURL: string): Promise<{ height: number; width: number }> {
    const image = await this.urlToImageElement(photoURL);
    return {height: image.height, width: image.width};
  }

  urlToImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      // needed to avoid cross-origin issues on CodeSandbox
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  }


}

export const PhotoUtilsContext = React.createContext<IPhotoUtils>(new PhotoUtils());

export const usePhotoUtils = () => useContext(PhotoUtilsContext);

const PhotoUtilsProvider = ({children}: { children: React.ReactNode }) => {
  return (
    <PhotoUtilsContext.Provider value={new PhotoUtils()}>
      {children}
    </PhotoUtilsContext.Provider>
  );
};

export default PhotoUtilsProvider;
