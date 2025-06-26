import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const GalleryPage = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 1280px)": { slidesToScroll: 1, slidesToShow: 4 },
        "(min-width: 1024px)": { slidesToScroll: 1, slidesToShow: 4 },
        "(min-width: 768px)": { slidesToScroll: 1, slidesToShow: 2 },
        "(max-width: 767px)": { slidesToScroll: 1, slidesToShow: 1 }
      }
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  useEffect(() => {
    const fetchGallery = async () => {
      setGalleryLoading(true);
      try {
        const res = await axios.get("/api/gallery");
        setGalleryImages(res.data.data || []);
      } catch (e) {
        setGalleryImages([]);
      }
      setGalleryLoading(false);
    };
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 font-sans">
      <Navigation />
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              Gallery
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Official gallery of Baunseth Sathipasala events and memories.
            </p>
          </motion.div>
          <div className="relative w-full">
            {galleryLoading ? (
              <div className="h-80 flex items-center justify-center text-lg text-gray-500">
                Loading images...
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-lg text-gray-400">
                No images
              </div>
            ) : (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={img._id || img.id || idx}
                      className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] p-0 m-0"
                    >
                      <motion.img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-[220px] object-cover"
                        style={{
                          boxShadow: "none",
                          border: "none",
                          background: "transparent",
                          margin: 0,
                          padding: 0,
                          display: "block"
                        }}
                        draggable={false}
                        whileHover={{
                          scale: 1.04
                        }}
                        whileTap={{
                          scale: 0.98
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GalleryPage;
 