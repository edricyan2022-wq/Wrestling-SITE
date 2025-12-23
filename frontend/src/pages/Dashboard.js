import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Play, Lock, Plus, Crown, Search, Filter, Upload, X, Image } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const { user, isAdmin, isPremium, loading } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const fileInputRef = useRef(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: '',
    video_url: '',
    thumbnail_url: '',
    is_premium: false
  });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API}/videos`, { withCredentials: true });
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/upload/thumbnail`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setNewVideo(prev => ({ ...prev, thumbnail_url: response.data.thumbnail_url }));
      toast.success('Thumbnail uploaded!');
    } catch (error) {
      toast.error('Failed to upload thumbnail');
      setThumbnailPreview(null);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setNewVideo(prev => ({ ...prev, thumbnail_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!newVideo.title || !newVideo.video_url || !newVideo.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      await axios.post(`${API}/videos`, newVideo, { withCredentials: true });
      toast.success('Video added successfully!');
      setIsUploadOpen(false);
      setNewVideo({
        title: '',
        description: '',
        category: '',
        video_url: '',
        thumbnail_url: '',
        is_premium: false
      });
      setThumbnailPreview(null);
      fetchVideos();
      fetchCategories();
    } catch (error) {
      toast.error('Failed to add video');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axios.delete(`${API}/videos/${videoId}`, { withCredentials: true });
      toast.success('Video deleted');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVideoClick = (video) => {
    if (video.is_locked) {
      toast.error('This is premium content. Upgrade your plan to access!');
      navigate('/pricing');
      return;
    }
    navigate(`/video/${video.video_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl text-white mb-4"
            data-testid="dashboard-title"
          >
            VIDEO <span className="text-[#dc2626]">LIBRARY</span>
          </motion.h1>
          <p className="text-[#a1a1aa] text-lg">
            {user ? `Welcome back, ${user.name}!` : 'Browse our wrestling tutorials'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
            <Input
              data-testid="search-input"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#18181b] border-[#27272a] text-white placeholder:text-[#a1a1aa]"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger 
              data-testid="category-filter"
              className="w-full md:w-48 bg-[#18181b] border-[#27272a] text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-[#27272a]">
              <SelectItem value="all" className="text-white">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#a1a1aa] text-lg mb-4">No videos found</p>
            {isAdmin && (
              <p className="text-[#a1a1aa]">Click the + button to add your first video!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.video_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`video-card-${video.video_id}`}
                className="bg-[#18181b] border border-[#27272a] group hover:border-[#dc2626]/50 transition-colors duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => handleVideoClick(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#27272a]">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-[#a1a1aa]" />
                    </div>
                  )}
                  
                  {/* Premium Badge */}
                  {video.is_premium && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-[#eab308] to-[#fbbf24] text-black px-2 py-1 text-xs font-bold uppercase flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}

                  {/* Lock Overlay */}
                  {video.is_locked && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-10 h-10 text-[#dc2626] mx-auto mb-2" />
                        <span className="text-white font-bold text-sm">PREMIUM ONLY</span>
                      </div>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  {!video.is_locked && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-[#dc2626] rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="text-[#dc2626] text-xs font-bold uppercase tracking-wider">
                    {video.category}
                  </span>
                  <h3 className="font-heading text-lg text-white mt-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-[#a1a1aa] text-sm mt-2 line-clamp-2">
                    {video.description}
                  </p>
                </div>

                {/* Admin Delete Button */}
                {isAdmin && (
                  <button
                    data-testid={`delete-video-${video.video_id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVideo(video.video_id);
                    }}
                    className="absolute top-3 left-3 bg-black/70 text-[#dc2626] p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Admin Upload Button */}
      {isAdmin && (
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <motion.button
              data-testid="admin-upload-btn"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-[#dc2626] text-white shadow-2xl flex items-center justify-center hover:bg-[#b91c1c] transition-colors"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </DialogTrigger>
          <DialogContent className="bg-[#18181b] border-[#27272a] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">ADD NEW VIDEO</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label className="text-[#a1a1aa]">Title *</Label>
                <Input
                  data-testid="video-title-input"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  className="bg-[#09090b] border-[#27272a] text-white"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label className="text-[#a1a1aa]">Description</Label>
                <Input
                  data-testid="video-description-input"
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  className="bg-[#09090b] border-[#27272a] text-white"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label className="text-[#a1a1aa]">Category *</Label>
                <Input
                  data-testid="video-category-input"
                  value={newVideo.category}
                  onChange={(e) => setNewVideo({...newVideo, category: e.target.value})}
                  className="bg-[#09090b] border-[#27272a] text-white"
                  placeholder="e.g., Basics, Takedowns, Secret Techniques"
                />
              </div>
              <div>
                <Label className="text-[#a1a1aa]">YouTube URL * (any YouTube link)</Label>
                <Input
                  data-testid="video-url-input"
                  value={newVideo.video_url}
                  onChange={(e) => setNewVideo({...newVideo, video_url: e.target.value})}
                  className="bg-[#09090b] border-[#27272a] text-white"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                />
                <p className="text-xs text-[#a1a1aa] mt-1">Paste any YouTube link - we'll convert it automatically</p>
              </div>
              <div>
                <Label className="text-[#a1a1aa]">Thumbnail Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  data-testid="thumbnail-file-input"
                />
                {thumbnailPreview ? (
                  <div className="relative mt-2">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-32 object-cover rounded border border-[#27272a]"
                    />
                    <button
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 bg-black/70 p-1 rounded-full hover:bg-black"
                      type="button"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {uploadingThumbnail && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                        <div className="animate-spin w-6 h-6 border-2 border-[#dc2626] border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 h-32 border-2 border-dashed border-[#27272a] rounded flex flex-col items-center justify-center gap-2 hover:border-[#dc2626]/50 transition-colors"
                    data-testid="thumbnail-upload-btn"
                  >
                    <Image className="w-8 h-8 text-[#a1a1aa]" />
                    <span className="text-sm text-[#a1a1aa]">Click to upload thumbnail</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[#a1a1aa]">Premium Content (Secret Technique)</Label>
                <Switch
                  data-testid="video-premium-switch"
                  checked={newVideo.is_premium}
                  onCheckedChange={(checked) => setNewVideo({...newVideo, is_premium: checked})}
                />
              </div>
              <Button
                data-testid="submit-video-btn"
                onClick={handleUpload}
                disabled={uploading || uploadingThumbnail}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              >
                {uploading ? 'Adding...' : 'Add Video'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
