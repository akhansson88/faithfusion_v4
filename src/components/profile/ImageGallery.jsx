import React from 'react';

function ImageGallery({ getRootProps, getInputProps, isDragActive, uploadedImages, handleDeleteImage }) {
  return (
    <div className="profile-section">
      <h2>Image Gallery</h2>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here ...</p>
        ) : (
          <p>Drag 'n' drop some images here, or click to select images (Max 5 images)</p>
        )}
      </div>
      <div className="image-preview">
        {uploadedImages.map((url, index) => (
          <div key={index} className="image-container">
            <img src={url} alt={`Uploaded image ${index + 1}`} />
            <button className="delete-image-button" onClick={() => handleDeleteImage(url)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGallery;
