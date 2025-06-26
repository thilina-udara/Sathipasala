import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTrash, FaEdit, FaPlus, FaImage } from "react-icons/fa";

const HomeSwiperAdmin = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [open, setOpen] = useState(false);
  const [editImage, setEditImage] = useState(null);

  // Form state
  const [form, setForm] = useState({
    image: null,
    title: "",
    description: "",
    link: ""
  });

  // For image preview
  const [preview, setPreview] = useState(null);

  // Fetch images
  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/home-swiper");
      setImages(res.data.data || []);
    } catch (e) {
      console.log("Failed to load images");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle open modal for add/edit
  const handleOpen = (img = null) => {
    setEditImage(img);
    setForm({
      image: null,
      title: img?.title || "",
      description: img?.description || "",
      link: img?.link || ""
    });
    setPreview(img?.url || null);
    setOpen(true);
  };

  // Handle close modal
  const handleClose = () => {
    setOpen(false);
    setEditImage(null);
    setForm({ image: null, title: "", description: "", link: "" });
    setPreview(null);
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((f) => ({ ...f, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Handle add/edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editImage) {
        // Edit (only title/desc/link, not image)
        res = await axios.put(
          `/api/home-swiper/${editImage._id}`,
          {
            title: form.title,
            description: form.description,
            link: form.link
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        console.log("Image updated");
      } else {
        // Add new
        if (!form.image) {
          console.log("Please select an image");
          return;
        }
        const fd = new FormData();
        fd.append("image", form.image);
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("link", form.link);
        res = await axios.post("/api/home-swiper", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        console.log("Image added");
      }
      handleClose();
      fetchImages();
    } catch (err) {
      console.log(err.response?.data?.message || "Failed to save image");
    }
  };

  // Handle delete
  const handleDelete = async (img) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`/api/home-swiper/${img._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      console.log("Image deleted");
      fetchImages();
    } catch (err) {
      console.log("Failed to delete image");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Homepage Swiper</h1>
        <Button onClick={() => handleOpen()} className="flex items-center gap-2">
          <FaPlus /> Add Image
        </Button>
      </div>

      {/* Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
        ) : images.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No images</div>
        ) : (
          images.map((img) => (
            <Card key={img._id} className="relative group">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaImage className="text-5xl text-gray-300" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpen(img)}
                      title="Edit"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(img)}
                      title="Delete"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-base">{img.title || <span className="italic text-gray-400">No title</span>}</CardTitle>
                <div className="text-sm text-gray-500 mb-2">{img.description}</div>
                {img.link && (
                  <a
                    href={img.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs underline"
                  >
                    {img.link}
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editImage ? "Edit Swiper Image" : "Add Swiper Image"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {!editImage && (
                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mt-2 h-32 w-full object-cover rounded"
                    />
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link</label>
                <Input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="Optional (e.g. https://...)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="ml-2">
                {editImage ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeSwiperAdmin;

