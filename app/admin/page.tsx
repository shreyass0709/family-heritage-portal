"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Shield, Users, Image as ImageIcon, BookOpen, Plus, 
  Upload, Trash2, ShieldAlert, Loader2, CheckCircle2, UserPlus,
  Edit2, X, ChevronDown, ChevronUp
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface DBPhoto {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface DBAlbum {
  id: string;
  title: string;
  category: string;
  familyGroup?: string | null;
  photos?: DBPhoto[];
}

interface DBMember {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  deathDate?: string | null;
  occupation?: string | null;
  education?: string | null;
  bio?: string | null;
  photo?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  timeline?: unknown;
  achievements?: unknown;
}

interface DBChapter {
  id: string;
  chapter: number;
  title: string;
  content: string;
}

interface DBUser {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string | null;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "gallery" | "book" | "users">("overview");

  // Data state
  const [members, setMembers] = useState<DBMember[]>([]);
  const [albums, setAlbums] = useState<DBAlbum[]>([]);
  const [chapters, setChapters] = useState<DBChapter[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Book Chapters Form States
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterNum, setChapterNum] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");

  // Forms states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Editing & Expansion states
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);

  // Add Member Form
  const [memberName, setMemberName] = useState("");
  const [memberGender, setMemberGender] = useState("MALE");
  const [memberBirthDate, setMemberBirthDate] = useState("");
  const [memberDeathDate, setMemberDeathDate] = useState("");
  const [memberOccupation, setMemberOccupation] = useState("");
  const [memberEducation, setMemberEducation] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [memberPhoto, setMemberPhoto] = useState("");
  const [memberFather, setMemberFather] = useState("");
  const [memberMother, setMemberMother] = useState("");
  const [memberSpouse, setMemberSpouse] = useState("");

  // Upload Photo Form
  const [photoFile, setPhotoFile] = useState<string>("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");

  // Create Album Form
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumCategory, setAlbumCategory] = useState("Weddings");
  const [albumGroup, setAlbumGroup] = useState("Full Family");

  // Redirect if guest/unauthorized
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    }
  }, [status, router]);

  // Load members, albums & book chapters
  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      const [mRes, aRes, cRes, uRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/gallery"),
        fetch("/api/chapters"),
        fetch("/api/admin/users")
      ]);
      if (mRes.ok && aRes.ok) {
        setMembers(await mRes.json());
        const albumData = await aRes.json();
        setAlbums(albumData);
        if (albumData.length > 0) {
          setSelectedAlbumId(albumData[0].id);
        }
      }
      if (cRes.ok) {
        setChapters(await cRes.json());
      }
      if (uRes.ok) {
        setUsers(await uRes.json());
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as { role?: string })?.role === "ADMIN") {
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, session]);

  // File to base64 converter helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Member creation or update
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Get the original member details if editing, to preserve timeline and achievements
    const originalMember = editingMemberId ? members.find(m => m.id === editingMemberId) : null;
    const timeline = originalMember && originalMember.timeline
      ? originalMember.timeline
      : [
          { year: new Date(memberBirthDate).getFullYear().toString(), title: "Birth", description: `Born in India.` }
        ];
    const achievements = originalMember && originalMember.achievements
      ? originalMember.achievements
      : [];

    try {
      const url = "/api/members";
      const method = editingMemberId ? "PUT" : "POST";
      const bodyPayload = {
        id: editingMemberId || undefined,
        name: memberName,
        gender: memberGender,
        birthDate: memberBirthDate,
        deathDate: memberDeathDate || null,
        occupation: memberOccupation || null,
        education: memberEducation || null,
        bio: memberBio || null,
        photo: memberPhoto || null,
        fatherId: memberFather || null,
        motherId: memberMother || null,
        spouseId: memberSpouse || null,
        timeline,
        achievements,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(editingMemberId 
          ? `Successfully updated ${memberName}'s details!` 
          : `Successfully added ${memberName} to the family registry!`
        );
        
        // Reset inputs and clear edit mode
        setMemberName("");
        setMemberBirthDate("");
        setMemberDeathDate("");
        setMemberOccupation("");
        setMemberEducation("");
        setMemberBio("");
        setMemberPhoto("");
        setMemberFather("");
        setMemberMother("");
        setMemberSpouse("");
        setEditingMemberId(null);
        
        loadDashboardData();
      } else {
        setErrorMsg(data.error || "Failed to save family member.");
      }
    } catch (err) {
      setErrorMsg("Connection failure. Try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditMember = (member: DBMember) => {
    setEditingMemberId(member.id);
    setMemberName(member.name || "");
    setMemberGender(member.gender || "MALE");
    setMemberBirthDate(member.birthDate || "");
    setMemberDeathDate(member.deathDate || "");
    setMemberOccupation(member.occupation || "");
    setMemberEducation(member.education || "");
    setMemberBio(member.bio || "");
    setMemberPhoto(member.photo || "");
    setMemberFather(member.fatherId || "");
    setMemberMother(member.motherId || "");
    setMemberSpouse(member.spouseId || "");
    
    // Scroll to the top of the form panel
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setMemberName("");
    setMemberGender("MALE");
    setMemberBirthDate("");
    setMemberDeathDate("");
    setMemberOccupation("");
    setMemberEducation("");
    setMemberBio("");
    setMemberPhoto("");
    setMemberFather("");
    setMemberMother("");
    setMemberSpouse("");
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from the registry? All relationships pointing to this person will be cleared.`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const res = await fetch(`/api/members?id=${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setSuccessMsg(`Successfully removed ${name} from the family registry.`);
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete member.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the album "${title}"? This will also permanently delete all photos inside it.`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const res = await fetch(`/api/gallery?albumId=${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setSuccessMsg(`Successfully deleted album "${title}".`);
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete album.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this photo?")) {
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const res = await fetch(`/api/gallery?photoId=${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setSuccessMsg("Successfully deleted photo.");
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete photo.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Album creation
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: albumTitle,
          category: albumCategory,
          familyGroup: albumGroup
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully created album "${albumTitle}"!`);
        setAlbumTitle("");
        loadDashboardData();
      } else {
        setErrorMsg(data.error || "Failed to create album.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Photo upload
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setErrorMsg("Please select an image file first.");
      return;
    }
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: photoFile,
          filename: "gallery_photo",
          albumId: selectedAlbumId,
          caption: photoCaption
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Photo successfully uploaded to the gallery!");
        setPhotoFile("");
        setPhotoCaption("");
        loadDashboardData();
      } else {
        setErrorMsg(data.error || "Failed to upload photo.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Chapter creation or update
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const url = "/api/chapters";
      const method = editingChapterId ? "PUT" : "POST";
      const bodyPayload = {
        id: editingChapterId || undefined,
        chapter: parseInt(chapterNum),
        title: chapterTitle,
        content: chapterContent
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(editingChapterId 
          ? `Successfully updated chapter ${chapterNum}!` 
          : `Successfully created chapter ${chapterNum}!`
        );
        
        setChapterNum("");
        setChapterTitle("");
        setChapterContent("");
        setEditingChapterId(null);
        
        loadDashboardData();
      } else {
        setErrorMsg(data.error || "Failed to save chapter.");
      }
    } catch (err) {
      setErrorMsg("Connection failure. Try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditChapter = (ch: DBChapter) => {
    setEditingChapterId(ch.id);
    setChapterNum(ch.chapter.toString());
    setChapterTitle(ch.title);
    setChapterContent(ch.content);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditChapter = () => {
    setEditingChapterId(null);
    setChapterNum("");
    setChapterTitle("");
    setChapterContent("");
  };

  const handleDeleteChapter = async (id: string, chapter: number, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Chapter ${chapter}: "${title}"?`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const res = await fetch(`/api/chapters?id=${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setSuccessMsg(`Successfully deleted Chapter ${chapter}.`);
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete chapter.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveUser = async (id: string, name: string) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: "MEMBER" })
      });
      
      if (res.ok) {
        setSuccessMsg(`Successfully approved access for "${name}".`);
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to approve user.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently deny access and delete the user account for "${name}"?`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setSuccessMsg(`Successfully removed user account "${name}".`);
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete user.");
      }
    } catch (err) {
      setErrorMsg("Connection failure.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loadingData)) {
    return (
      <div className="h-screen w-full bg-[#060913] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin text-gold mr-3" size={28} />
        <span>Loading Admin Panel Dashboard...</span>
      </div>
    );
  }

  // Double check authorization
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (status === "authenticated" && !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="h-screen w-full bg-[#060913] flex flex-col items-center justify-center text-center px-6">
          <div className="glass-panel border border-red-500/20 max-w-md p-8 rounded-2xl flex flex-col items-center space-y-6">
            <ShieldAlert size={64} className="text-red-500 animate-pulse" />
            <h1 className="font-serif text-3xl font-bold text-white">403 - Access Denied</h1>
            <p className="text-slate-400 text-sm">
              Your account role is currently set to <span className="text-red-400 font-bold uppercase">{(session?.user as { role?: string })?.role}</span>. Only authenticated Administrators can access the management panel.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-black bg-gold hover:bg-amber-400 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Go to Home Page
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Calculate statistics
  const totalPhotos = albums.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#060913] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-6">
            <div>
              <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold flex items-center gap-1.5">
                <Shield size={14} className="text-amber-500" />
                Security Clearance Level: Admin
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mt-2">
                Madubana Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                Manage the family trees, seed profile biographical milestones, and add new photos.
              </p>
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center bg-slate-900/80 border border-white/10 p-1 rounded-lg backdrop-blur-sm">
              <button
                onClick={() => { setActiveTab("overview"); setSuccessMsg(null); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "overview" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => { setActiveTab("members"); setSuccessMsg(null); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "members" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Members
              </button>
              
              <button
                onClick={() => { setActiveTab("gallery"); setSuccessMsg(null); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "gallery" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Gallery
              </button>

              <button
                onClick={() => { setActiveTab("book"); setSuccessMsg(null); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "book" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                History Book
              </button>

              <button
                onClick={() => { setActiveTab("users"); setSuccessMsg(null); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "users" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Users
              </button>
            </div>
          </div>

          {/* Form Notification Messages */}
          {successMsg && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-4.5 rounded-lg">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-4.5 rounded-lg">
              <ShieldAlert size={16} className="shrink-0 text-rose-400" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          {/* 1. OVERVIEW TAB PANEL */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                
                {/* Stat 1 */}
                <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Registry Members</span>
                    <p className="text-3xl font-serif font-bold text-white">{members.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gold/5 text-gold border border-gold/10 shrink-0">
                    <Users size={22} />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Photo Albums</span>
                    <p className="text-3xl font-serif font-bold text-white">{albums.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gold/5 text-gold border border-gold/10 shrink-0">
                    <BookOpen size={22} />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">Photographs</span>
                    <p className="text-3xl font-serif font-bold text-white">{totalPhotos}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gold/5 text-gold border border-gold/10 shrink-0">
                    <ImageIcon size={22} />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Book Chapters</span>
                    <p className="text-3xl font-serif font-bold text-white">{chapters.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gold/5 text-gold border border-gold/10 shrink-0">
                    <BookOpen size={22} className="text-amber-500" />
                  </div>
                </div>

                {/* Stat 5 - Pending Users */}
                <div className={`glass-panel border rounded-2xl p-6 flex items-center justify-between shadow-xl transition-all ${
                  users.filter(u => u.role === "PENDING").length > 0
                    ? "border-amber-500/35 bg-amber-500/5"
                    : "border-white/5"
                }`}>
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Pending Approvals</span>
                    <p className={`text-3xl font-serif font-bold ${
                      users.filter(u => u.role === "PENDING").length > 0 ? "text-amber-400 animate-pulse" : "text-white"
                    }`}>
                      {users.filter(u => u.role === "PENDING").length}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl shrink-0 border ${
                    users.filter(u => u.role === "PENDING").length > 0
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}>
                    <ShieldAlert size={22} />
                  </div>
                </div>

              </div>

              {/* Quick Profile Summary */}
              <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold">
                  <Shield size={32} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Administrator: {session?.user?.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Logged in via {session?.user?.email}. Permissions granted: Full database migrations, member additions, and photo gallery uploads.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. MEMBERS TAB PANEL */}
          {activeTab === "members" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start animate-fade-in">
              
              {/* Form panel */}
              <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl p-8 shadow-xl relative">
                <h3 className="font-serif text-2xl font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
                  {editingMemberId ? <Edit2 className="text-gold" size={20} /> : <UserPlus className="text-gold" size={20} />}
                  {editingMemberId ? "Edit Family Member" : "Add Family Member"}
                </h3>

                <form onSubmit={handleAddMember} className="space-y-6">
                  
                  {/* Name and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Kuppaya Poojari"
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/35"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gender *</label>
                      <select
                        value={memberGender}
                        onChange={(e) => setMemberGender(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={memberBirthDate}
                        onChange={(e) => setMemberBirthDate(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Date of Passing (Leave empty if alive)</label>
                      <input
                        type="date"
                        value={memberDeathDate}
                        onChange={(e) => setMemberDeathDate(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Job and Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Occupation / Career</label>
                      <input
                        type="text"
                        value={memberOccupation}
                        onChange={(e) => setMemberOccupation(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Education Degree</label>
                      <input
                        type="text"
                        value={memberEducation}
                        onChange={(e) => setMemberEducation(e.target.value)}
                        placeholder="e.g. B.E. in Computer Science"
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Biography / Short Story</label>
                    <textarea
                      value={memberBio}
                      onChange={(e) => setMemberBio(e.target.value)}
                      placeholder="Write a warm, short history of their life achievements and personality..."
                      rows={4}
                      className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {/* Family Connections Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Father Link</label>
                      <select
                        value={memberFather}
                        onChange={(e) => setMemberFather(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="">-- No Father Connected --</option>
                        {members.filter(m => m.gender === "MALE" && m.id !== editingMemberId).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mother Link</label>
                      <select
                        value={memberMother}
                        onChange={(e) => setMemberMother(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="">-- No Mother Connected --</option>
                        {members.filter(m => m.gender === "FEMALE" && m.id !== editingMemberId).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Spouse Link</label>
                      <select
                        value={memberSpouse}
                        onChange={(e) => setMemberSpouse(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="">-- No Spouse Connected --</option>
                        {members.filter(m => m.id !== editingMemberId).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Photo Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setMemberPhoto)}
                        className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 file:cursor-pointer"
                      />
                      {memberPhoto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={memberPhoto} alt="Preview" className="w-12 h-12 object-cover rounded-full border border-gold/30" />
                      )}
                    </div>
                  </div>

                  {/* Submit and Cancel Edit */}
                  <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 text-black bg-gold hover:bg-amber-400 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer w-full md:w-auto"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : editingMemberId ? <Edit2 size={14} /> : <Plus size={14} />}
                      {editingMemberId ? "Update Member" : "Register Member"}
                    </button>
                    {editingMemberId && (
                      <button
                        type="button"
                        onClick={cancelEditMember}
                        className="flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full md:w-auto"
                      >
                        <X size={14} />
                        Cancel Edit
                      </button>
                    )}
                  </div>

                </form>
              </div>

              {/* Members List sidebar */}
              <div className="lg:col-span-1 glass-panel border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-3">
                  Current Registry ({members.length})
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-white/5 hover:border-gold/10 transition-colors gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold text-xs shrink-0 overflow-hidden relative">
                          {m.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.name.charAt(0)
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white leading-none truncate">{m.name}</p>
                          <p className="text-[9px] text-slate-400 mt-1 truncate">{m.occupation || "Member"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditMember(m)}
                          className="p-1 text-slate-400 hover:text-gold hover:bg-white/5 rounded transition-colors cursor-pointer"
                          title="Edit details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m.id, m.name)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 3. GALLERY TAB PANEL */}
          {activeTab === "gallery" && (
            <div className="space-y-12 animate-fade-in">
              {/* Forms Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Photo Upload Form */}
                <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl space-y-6">
                  <h3 className="font-serif text-2xl font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
                    <Upload className="text-gold" size={20} />
                    Upload Photo to Album
                  </h3>

                  <form onSubmit={handleUploadPhoto} className="space-y-5">
                    
                    {/* Select Album */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Album *</label>
                      <select
                        value={selectedAlbumId}
                        onChange={(e) => setSelectedAlbumId(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      >
                        {albums.map((alb) => (
                          <option key={alb.id} value={alb.id}>
                            {alb.title} ({alb.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Caption */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Photo Caption</label>
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="e.g. Grandfather celebrating in village..."
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* File Upload Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Image File *</label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setPhotoFile)}
                          className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 file:cursor-pointer"
                        />
                        {photoFile && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoFile}
                            alt="Photo Preview"
                            className="w-full h-40 object-cover rounded-lg border border-gold/20 mt-2"
                          />
                        )}
                      </div>
                    </div>

                    {/* Submit Photo */}
                    <button
                      type="submit"
                      disabled={submitting || !photoFile}
                      className="flex items-center justify-center gap-2 text-black bg-gold hover:bg-amber-400 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer w-full"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      Upload to Gallery
                    </button>

                  </form>
                </div>

                {/* Create Album Form */}
                <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl space-y-6">
                  <h3 className="font-serif text-2xl font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
                    <Plus className="text-gold" size={20} />
                    Create New Album
                  </h3>

                  <form onSubmit={handleCreateAlbum} className="space-y-5">
                    
                    {/* Album Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Album Title *</label>
                      <input
                        type="text"
                        required
                        value={albumTitle}
                        onChange={(e) => setAlbumTitle(e.target.value)}
                        placeholder="e.g. Diwali celebration 2025"
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Album Category *</label>
                      <select
                        value={albumCategory}
                        onChange={(e) => setAlbumCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      >
                        <option value="Weddings">Weddings</option>
                        <option value="Birthdays">Birthdays</option>
                        <option value="Festivals">Festivals</option>
                        <option value="Trips">Trips</option>
                        <option value="Recent">Recent</option>
                      </select>
                    </div>

                    {/* Family Group selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Family Branch Association *</label>
                      <select
                        value={albumGroup}
                        onChange={(e) => setAlbumGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      >
                        <option value="Full Family">Full Family (Shared)</option>
                        <option value="Family A (Bangalore)">Family A (Bangalore)</option>
                        <option value="Family B (Mangalore)">Family B (Mangalore)</option>
                      </select>
                    </div>

                    {/* Submit Album */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 text-black bg-gold hover:bg-amber-400 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer w-full"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Create Album Category
                    </button>

                  </form>
                </div>

              </div>

              {/* Management Section */}
              <div className="border-t border-white/5 pt-8">
                <h3 className="font-serif text-2xl font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
                  <ImageIcon className="text-gold" size={20} />
                  Manage Albums & Photos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {albums.map((album) => {
                    const isExpanded = expandedAlbumId === album.id;
                    return (
                      <div key={album.id} className="glass-panel border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-serif text-lg font-bold text-white leading-snug">{album.title}</h4>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400">
                              Category: {album.category} • {album.photos?.length || 0} Photos
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedAlbumId(isExpanded ? null : album.id)}
                              className="p-2 text-slate-400 hover:text-gold hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                              title={isExpanded ? "Collapse photos" : "Expand photos"}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAlbum(album.id, album.title)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                              title="Delete album"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Photos Grid */}
                        {isExpanded && (
                          <div className="border-t border-white/5 pt-4 animate-fade-in">
                            {album.photos && album.photos.length > 0 ? (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {album.photos.map((photo) => (
                                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group border border-white/5 bg-slate-950">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={photo.imageUrl}
                                      alt={photo.caption || "Family Photo"}
                                      className="w-full h-full object-cover"
                                    />
                                    {/* Delete overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePhoto(photo.id)}
                                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors cursor-pointer"
                                        title="Delete photo"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic text-center py-4">This album has no photos yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 4. BOOK TAB PANEL */}
          {activeTab === "book" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start animate-fade-in">
              
              {/* Form panel */}
              <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl p-8 shadow-xl relative">
                <h3 className="font-serif text-2xl font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
                  <BookOpen className="text-gold" size={20} />
                  {editingChapterId ? "Edit Book Chapter" : "Add Book Chapter"}
                </h3>

                <form onSubmit={handleSaveChapter} className="space-y-6">
                  
                  {/* Chapter number and Title */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Chapter Number *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={chapterNum}
                        onChange={(e) => setChapterNum(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Chapter Title *</label>
                      <input
                        type="text"
                        required
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        placeholder="e.g. Chapter 1: The Beginnings in Mangalore"
                        className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Chapter Content */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Chapter Content (Text or HTML) *</label>
                    <textarea
                      required
                      value={chapterContent}
                      onChange={(e) => setChapterContent(e.target.value)}
                      placeholder="Write the chapter content here. You can use multiple lines..."
                      rows={12}
                      className="w-full bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg p-3 text-sm text-white focus:outline-none font-serif leading-relaxed"
                    />
                  </div>

                  {/* Submit and Cancel Edit */}
                  <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 text-black bg-gold hover:bg-amber-400 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer w-full md:w-auto"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : editingChapterId ? <Edit2 size={14} /> : <Plus size={14} />}
                      {editingChapterId ? "Update Chapter" : "Create Chapter"}
                    </button>
                    {editingChapterId && (
                      <button
                        type="button"
                        onClick={cancelEditChapter}
                        className="flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full md:w-auto"
                      >
                        <X size={14} />
                        Cancel Edit
                      </button>
                    )}
                  </div>

                </form>
              </div>

              {/* Chapters List sidebar */}
              <div className="lg:col-span-1 glass-panel border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-3">
                  Chapters List ({chapters.length})
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {chapters.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-white/5 hover:border-gold/10 transition-colors gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold text-xs shrink-0">
                          {ch.chapter}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white leading-none truncate">{ch.title}</p>
                          <p className="text-[9px] text-slate-400 mt-1 truncate">
                            {ch.content.slice(0, 40)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditChapter(ch)}
                          className="p-1 text-slate-400 hover:text-gold hover:bg-white/5 rounded transition-colors cursor-pointer"
                          title="Edit chapter"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(ch.id, ch.chapter, ch.title)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                          title="Delete chapter"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {chapters.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">No chapters registered yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. USERS TAB PANEL */}
          {activeTab === "users" && (
            <div className="space-y-8 animate-fade-in">
              <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl">
                <h3 className="font-serif text-2xl font-bold text-white mb-6 pb-3 border-b border-white/5 flex items-center gap-2">
                  <ShieldAlert className="text-gold" size={24} />
                  Pending Access Requests ({users.filter((u) => u.role === "PENDING").length})
                </h3>

                {users.filter((u) => u.role === "PENDING").length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users
                      .filter((u) => u.role === "PENDING")
                      .map((u) => (
                        <div
                          key={u.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-lg shrink-0 overflow-hidden relative">
                              {u.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                u.name.charAt(0)
                              )}
                            </div>
                            <div className="truncate">
                              <h4 className="text-sm font-bold text-white leading-tight truncate">{u.name}</h4>
                              <p className="text-xs text-slate-400 font-sans mt-0.5 truncate">{u.email}</p>
                              <p className="text-[10px] text-amber-400/80 font-mono mt-1">Requested Access</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                            <button
                              onClick={() => handleApproveUser(u.id, u.name)}
                              disabled={submitting}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-black bg-gold hover:bg-amber-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle2 size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={submitting}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <X size={13} />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                    <p className="text-xs text-slate-500 italic">No pending access requests.</p>
                  </div>
                )}
              </div>

              <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl">
                <h3 className="font-serif text-2xl font-bold text-white mb-6 pb-3 border-b border-white/5 flex items-center gap-2">
                  <Users className="text-gold" size={24} />
                  Active User Accounts ({users.filter((u) => u.role !== "PENDING").length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <th className="py-4 px-4">User</th>
                        <th className="py-4 px-4">Email Address</th>
                        <th className="py-4 px-4">Role</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users
                        .filter((u) => u.role !== "PENDING")
                        .map((u) => (
                          <tr key={u.id} className="text-xs text-slate-300 hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-4 font-semibold text-white">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold text-xs shrink-0 overflow-hidden relative">
                                  {u.photo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                                  ) : (
                                    u.name.charAt(0)
                                  )}
                                </div>
                                <span>{u.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-sans text-slate-400">{u.email}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "ADMIN" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-gold/10 text-gold border border-gold/20"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {u.email !== session?.user?.email ? (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  disabled={submitting}
                                  className="text-slate-400 hover:text-red-400 p-2 hover:bg-white/5 rounded transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                                  title="Delete user account"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove Account</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">Active Session</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
