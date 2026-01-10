"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Upload, Plus, Save } from "lucide-react";
import AppHeader from "@/components/shared/AppHeader";

import { createTrip } from "../actions";
import { uploadImageAction } from "@/app/actions/image-upload";

export default function CreateTrip() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("linear-gradient(to bottom right, #ff9a9e, #fecfef)");
  const [isUploading, setIsUploading] = useState(false);

  const suggestedPlaces = [
    { id: 1, name: "Kyoto, Japan", image: "linear-gradient(to bottom right, #ff9a9e, #fecfef)" },
    { id: 2, name: "Santorini, Greece", image: "linear-gradient(to bottom right, #a18cd1, #fbc2eb)" },
    { id: 3, name: "Banff, Canada", image: "linear-gradient(to bottom right, #84fab0, #8fd3f4)" },
    { id: 4, name: "Maui, Hawaii", image: "linear-gradient(to bottom right, #fccb90, #d57eeb)" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />

      <div className="w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-600/20 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl w-full max-w-6xl p-6 md:p-12 relative z-10"
        >
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
              Create a New Trip
            </h1>
            <p className="text-white/60 text-lg">Start planning your next adventure</p>
          </header>

          <form action={createTrip}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 ml-1">Trip Name</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g., Summer in Italy"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:bg-white/10 focus:border-white/30 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 ml-1">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                      <input
                        name="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 ml-1">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                      <input
                        name="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 ml-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="What are you planning? (e.g., visiting museums, hiking, trying local food)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:bg-white/10 focus:border-white/30 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Upload & Suggestions */}
              <div className="space-y-6 flex flex-col">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 ml-1">Cover Photo</label>
                  <input type="hidden" name="coverPhoto" value={coverPhoto} />

                  <div
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="relative border-dashed border-2 border-white/20 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group bg-white/5 overflow-hidden"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-white/60">Uploading...</span>
                      </div>
                    ) : coverPhoto && !coverPhoto.startsWith('linear-gradient') ? (
                      <>
                        <img src={coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-8 h-8 text-white mb-2" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-white/60 mb-2 group-hover:text-white group-hover:scale-110 transition-all" />
                        <span className="text-sm text-white/60 group-hover:text-white transition-colors">Click to upload or drag & drop</span>
                      </>
                    )}

                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsUploading(true);
                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          const result = await uploadImageAction(formData);
                          if (result.success && result.url) {
                            setCoverPhoto(result.url);
                          } else {
                            console.error("Upload failed");
                          }
                        } catch (err) {
                          console.error("Error uploading photo", err);
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-white/80 ml-1 mb-2">Suggested Places</label>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {suggestedPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="relative rounded-lg overflow-hidden cursor-pointer group h-full min-h-[80px]"
                        style={{ background: place.image }}
                        onClick={() => {
                          setTripName(place.name);
                          setCoverPhoto(place.image);
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                          <span className="text-xs font-medium text-white">{place.name}</span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/20 backdrop-blur-md p-1 rounded-full">
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-8 py-3 rounded-full font-semibold text-lg flex items-center gap-2 group transition-all shadow-lg shadow-purple-500/20">
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Save / Create Trip
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
