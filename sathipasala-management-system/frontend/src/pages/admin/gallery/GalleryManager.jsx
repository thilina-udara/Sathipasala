import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FaTrash, FaPlus, FaSyncAlt, FaEdit } from "react-icons/fa";

const GalleryManager = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [editAlt, setEditAlt] = useState("");

  // Fetch gallery images
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/gallery", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGallery(res.data.data || []);
    } catch (err) {
      setError("Failed to fetch gallery images");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Handle image upload
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("alt", alt);
      const res = await axios.post("/api/gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setGallery((prev) => [res.data.data, ...prev]);
      setShowDialog(false);
      setFile(null);
      setAlt("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
    setUploading(false);
  };

  // Handle image delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGallery((prev) => prev.filter((img) => img._id !== id));
    } catch (err) {
      setError("Delete failed");
    }
  };

  // Handle edit alt text
  const handleEditAlt = async (e) => {
    e.preventDefault();
    if (!selectedImage) return;
    try {
      await axios.put(
        `/api/gallery/${selectedImage._id}`,
        { alt: editAlt },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setGallery((prev) =>
        prev.map((img) =>
          img._id === selectedImage._id ? { ...img, alt: editAlt } : img
        )
      );
      setEditDialog(false);
      setSelectedImage(null);
      setEditAlt("");
    } catch (err) {
      setError("Failed to update image description");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-200">Gallery Management</h1>
        <div className="flex gap-2">
          <Button onClick={fetchGallery} variant="outline" size="sm">
            <FaSyncAlt className="mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowDialog(true)} size="sm">
            <FaPlus className="mr-2" /> Add Image
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading...</div>
        ) : gallery.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No images in gallery</div>
        ) : (
          gallery.map((img) => (
            <div
              key={img._id}
              className="relative group rounded-lg overflow-hidden shadow border bg-white dark:bg-gray-800"
            >
              <img
                src={img.url}
                alt={img.alt || "Gallery"}
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedImage(img);
                    setEditAlt(img.alt || "");
                    setEditDialog(true);
                  }}
                  title="Edit"
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(img._id)}
                  title="Delete"
                >
                  <FaTrash />
                </Button>
              </div>
              {img.alt && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                  {img.alt}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
            <DialogDescription>
              Upload a new image to the gallery. Only images up to 5MB are allowed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files[0])}
              disabled={uploading}
            />
            <Input
              type="text"
              placeholder="Image description (optional)"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={uploading}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Alt Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Description</DialogTitle>
            <DialogDescription>
              Update the description for this gallery image.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAlt} className="space-y-4">
            <Input
              type="text"
              placeholder="Image description"
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              required
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryManager;
