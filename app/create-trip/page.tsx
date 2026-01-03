"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Upload, Plus, Save } from "lucide-react";

import { createTrip } from "../actions";

export default function CreateTrip() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const suggestedPlaces = [
    { id: 1, name: "Kyoto, Japan", image: "linear-gradient(to bottom right, #ff9a9e, #fecfef)" },
    { id: 2, name: "Santorini, Greece", image: "linear-gradient(to bottom right, #a18cd1, #fbc2eb)" },
    { id: 3, name: "Banff, Canada", image: "linear-gradient(to bottom right, #84fab0, #8fd3f4)" },
    { id: 4, name: "Maui, Hawaii", image: "linear-gradient(to bottom right, #fccb90, #d57eeb)" },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px]" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-600/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card w-full max-w-6xl p-8 md:p-12 relative z-10"
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
                  className="glass-input w-full px-4 py-3 rounded-xl"
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
                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl"
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
                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl"
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
                  className="glass-input w-full px-4 py-3 rounded-xl resize-none"
                />
              </div>
            </div>

            {/* Right Column: Upload & Suggestions */}
            <div className="space-y-6 flex flex-col">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Cover Photo</label>
                {/* Hidden input to store selected image URL/Gradient for now */}
                <input type="hidden" name="coverPhoto" value="linear-gradient(to bottom right, #ff9a9e, #fecfef)" />
                <div className="glass-input border-dashed border-2 border-white/20 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group">
                  <Upload className="w-8 h-8 text-white/60 mb-2 group-hover:text-white group-hover:scale-110 transition-all" />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Click to upload or drag & drop</span>
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
                        // Ideally set cover photo here too
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
            <button type="submit" className="glass-button px-8 py-3 rounded-full font-semibold text-lg flex items-center gap-2 group">
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Save / Create Trip
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
