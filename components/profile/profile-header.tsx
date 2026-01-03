'use client';

import { useState } from 'react';
import { Camera, Edit2, Save, X, MapPin } from 'lucide-react';
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
            // Handle error (toast, etc.)
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        setTempProfile(profile);
        setIsEditing(false);
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5">
            {/* Background Gradient Mesh - Enhanced */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none mix-blend-overlay" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-30" />

            {/* Header Banner */}
            <div className="h-40 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30 backdrop-blur-md border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b')] bg-cover bg-center opacity-20 mix-blend-overlay" />
            </div>

            <div className="px-8 pb-10 relative z-10">
                <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-20 md:space-x-8">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="h-40 w-40 rounded-[2rem] border-4 border-black/20 overflow-hidden bg-zinc-900 shadow-2xl ring-1 ring-white/20 relative z-10 backdrop-blur-sm">
                            {profile.avatarUrl ? (
                                <Image
                                    src={profile.avatarUrl}
                                    alt={profile.firstName}
                                    width={160}
                                    height={160}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-5xl font-bold text-white">
                                    {profile.firstName?.[0]}
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <button className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-300 text-white cursor-pointer backdrop-blur-sm border border-white/10">
                                <Camera className="w-8 h-8 drop-shadow-lg" />
                            </button>
                        )}
                    </div>

                    {/* Info / Edit Form */}
                    <div className="flex-1 mt-6 md:mt-0 text-center md:text-left w-full space-y-4 pt-2">
                        {isEditing ? (
                            <div className="space-y-4 w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-purple-200/70 font-bold pl-1">First Name</label>
                                        <input
                                            type="text"
                                            value={tempProfile.firstName}
                                            onChange={(e) => setTempProfile({ ...tempProfile, firstName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10"
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-purple-200/70 font-bold pl-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={tempProfile.lastName}
                                            onChange={(e) => setTempProfile({ ...tempProfile, lastName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-purple-200/70 font-bold pl-1">Bio</label>
                                    <textarea
                                        value={tempProfile.bio}
                                        onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-gray-600 min-h-[120px] resize-none focus:bg-white/10"
                                        placeholder="Tell us about your travel dreams..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent tracking-tight">
                                        {profile.firstName} {profile.lastName}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                            <MapPin className="w-3 h-3" /> Earth Traveler
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-300/90 text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
                                    {profile.bio || "No bio yet."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 md:mt-0 flex gap-3 self-end md:self-auto md:mb-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/20 font-medium disabled:opacity-50 hover:scale-105 active:scale-95"
                                    title="Save Profile"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 font-medium hover:scale-105 active:scale-95 backdrop-blur-md"
                                    title="Cancel"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md font-medium shadow-lg hover:shadow-purple-500/10 hover:border-white/20 hover:scale-105 active:scale-95"
                            >
                                <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
