'use client';

import { useState } from 'react';
import { Camera, Edit2, Save, X, MapPin, Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { updateUserProfile } from '@/lib/actions/profile';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    avatarUrl: string;
}

interface ProfileHeaderProps {
    initialProfile: UserProfile;
}

export function ProfileHeader({ initialProfile }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(initialProfile);
    const [tempProfile, setTempProfile] = useState(profile);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('firstName', tempProfile.firstName);
        formData.append('lastName', tempProfile.lastName);
        formData.append('bio', tempProfile.bio || '');

        const result = await updateUserProfile(formData);

        if (result.success) {
            setProfile(tempProfile);
            setIsEditing(false);
        } else {
            console.error(result.error);
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        setTempProfile(profile);
        setIsEditing(false);
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
            {/* Minimal Background Header */}
            <div className="h-48 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-zinc-900/20 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)]" />
            </div>

            <div className="px-4 md:px-8 pb-8">
                <div className="relative flex flex-col md:flex-row items-center md:items-start -mt-12 md:-mt-16 gap-4 md:gap-6">
                    {/* Avatar Group */}
                    <div className="relative group shrink-0">
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl border-4 border-[#0A0A0A] bg-zinc-800 shadow-xl overflow-hidden relative z-10">
                            {profile.avatarUrl ? (
                                <Image
                                    src={profile.avatarUrl}
                                    alt={profile.firstName}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-3xl font-bold text-white/20">
                                    {profile.firstName?.[0]}
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <button className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 w-full pt-4 md:pt-16 text-center md:text-left">
                        {isEditing ? (
                            <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 mx-auto md:mx-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">First Name</label>
                                        <input
                                            type="text"
                                            value={tempProfile.firstName}
                                            onChange={(e) => setTempProfile({ ...tempProfile, firstName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={tempProfile.lastName}
                                            onChange={(e) => setTempProfile({ ...tempProfile, lastName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">Bio</label>
                                    <textarea
                                        value={tempProfile.bio}
                                        onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all min-h-[100px] resize-none"
                                        placeholder="Write a short bio..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                                        {profile.firstName} {profile.lastName}
                                    </h1>
                                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2 text-zinc-400 text-sm">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            {profile.email}
                                        </span>
                                        <span className="hidden md:inline w-1 h-1 rounded-full bg-zinc-700" />
                                        <span className="flex items-center gap-1.5 text-indigo-400">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Travel Enthusiast
                                        </span>
                                    </div>
                                </div>
                                <p className="text-zinc-300 leading-relaxed max-w-2xl mx-auto md:mx-0">
                                    {profile.bio || "No bio yet."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="static md:absolute md:top-4 md:right-4 md:mt-16 md:mr-0 z-10 w-full md:w-auto flex justify-center md:block mt-4 md:mt-0">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors shadow-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full md:w-auto justify-center p-2 md:px-4 md:py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span className="">Edit Profile</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
