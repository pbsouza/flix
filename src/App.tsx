import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Video, Category } from './types';
import { FocusProvider } from './context/FocusContext';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { VideoRow } from './components/VideoRow';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryView } from './components/CategoryView';
import { SearchView } from './components/SearchView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminVideos } from './components/admin/AdminVideos';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminSettings } from './components/admin/AdminSettings';
import {
  fetchPublicVideos,
  fetchAdminVideos,
  fetchCategories,
  verifyAdminAuth,
  createVideo,
  updateVideo,
  deleteVideo,
  createCategory,
  updateCategory,
  deleteCategory,
} from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  // Data states
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin states
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Load public videos & categories
  const loadPublicData = useCallback(async () => {
    try {
      const [vList, cList] = await Promise.all([
        fetchPublicVideos(),
        fetchCategories(false),
      ]);
      setVideos(vList);
      setCategories(cList);
    } catch (e) {
      console.error('Failed to load public data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load admin videos & categories
  const loadAdminData = useCallback(async () => {
    try {
      const [vList, cList] = await Promise.all([
        fetchAdminVideos(),
        fetchCategories(true),
      ]);
      setVideos(vList);
      setCategories(cList);
    } catch (e) {
      console.error('Failed to load admin data', e);
    }
  }, []);

  // Verify Admin JWT token on mount or view change
  useEffect(() => {
    const checkAuth = async () => {
      const ok = await verifyAdminAuth();
      setIsAdminAuth(ok);
      if (ok && currentView === 'admin') {
        loadAdminData();
      } else {
        loadPublicData();
      }
    };
    checkAuth();
  }, [currentView, loadAdminData, loadPublicData]);

  // Handle Video Selection
  const handleSelectVideo = (video: Video) => {
    setPlayingVideo(video);
  };

  // --- ADMIN ACTIONS ---
  const handleSaveVideoAdmin = async (data: Partial<Video>, isEdit: boolean, id?: string) => {
    if (isEdit && id) {
      await updateVideo(id, data);
    } else {
      await createVideo(data);
    }
    await loadAdminData();
  };

  const handleDeleteVideoAdmin = async (id: string) => {
    await deleteVideo(id);
    await loadAdminData();
  };

  const handleToggleActiveAdmin = async (video: Video) => {
    await updateVideo(video.id, { active: !video.active });
    await loadAdminData();
  };

  const handleToggleFeaturedAdmin = async (video: Video) => {
    await updateVideo(video.id, { featured: !video.featured });
    await loadAdminData();
  };

  const handleCreateCategoryAdmin = async (name: string, active: boolean) => {
    await createCategory(name, active);
    await loadAdminData();
  };

  const handleUpdateCategoryAdmin = async (id: string, updates: Partial<Category>) => {
    await updateCategory(id, updates);
    await loadAdminData();
  };

  const handleDeleteCategoryAdmin = async (id: string) => {
    await deleteCategory(id);
    await loadAdminData();
  };

  // Find main featured video
  const featuredVideo = videos.find((v) => v.featured) || videos[0] || null;

  // Group videos by category for Home carousels
  const categoriesWithVideos = categories
    .map((cat) => ({
      category: cat,
      videos: videos.filter((v) => v.category_id === cat.id),
    }))
    .filter((item) => item.videos.length > 0);

  return (
    <FocusProvider>
      <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 selection:text-white">
        {/* Fullscreen Video Player Modal */}
        {playingVideo && (
          <VideoPlayer
            video={playingVideo}
            category={categories.find((c) => c.id === playingVideo.category_id)}
            onClose={() => setPlayingVideo(null)}
          />
        )}

        {/* ADMIN VIEW RENDER */}
        {currentView === 'admin' ? (
          !isAdminAuth ? (
            <AdminLogin
              onLoginSuccess={() => {
                setIsAdminAuth(true);
                loadAdminData();
              }}
              onBackToPublic={() => setCurrentView('home')}
            />
          ) : (
            <AdminLayout
              currentTab={adminTab}
              onTabChange={setAdminTab}
              onLogout={() => {
                setIsAdminAuth(false);
                setCurrentView('home');
              }}
              onViewPublic={() => setCurrentView('home')}
            >
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  videos={videos}
                  categories={categories}
                  onNavigateToVideos={() => setAdminTab('videos')}
                  onNavigateToCategories={() => setAdminTab('categories')}
                />
              )}
              {adminTab === 'videos' && (
                <AdminVideos
                  videos={videos}
                  categories={categories}
                  onSaveVideo={handleSaveVideoAdmin}
                  onDeleteVideo={handleDeleteVideoAdmin}
                  onToggleActive={handleToggleActiveAdmin}
                  onToggleFeatured={handleToggleFeaturedAdmin}
                  onViewVideoPublic={handleSelectVideo}
                />
              )}
              {adminTab === 'categories' && (
                <AdminCategories
                  categories={categories}
                  onCreateCategory={handleCreateCategoryAdmin}
                  onUpdateCategory={handleUpdateCategoryAdmin}
                  onDeleteCategory={handleDeleteCategoryAdmin}
                />
              )}
              {adminTab === 'settings' && <AdminSettings />}
            </AdminLayout>
          )
        ) : (
          /* PUBLIC VIEW RENDER */
          <div className="min-h-screen flex flex-col">
            <Header currentView={currentView} onNavigate={setCurrentView} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-zinc-400 text-sm font-semibold">
                    Carregando catálogo CineStream...
                  </span>
                </div>
              ) : (
                <>
                  {/* HOME VIEW */}
                  {currentView === 'home' && (
                    <div className="space-y-8">
                      {/* Featured Hero Banner */}
                      <HeroFeatured
                        video={featuredVideo}
                        categories={categories}
                        onPlay={handleSelectVideo}
                      />

                      {/* Recent Launches Row */}
                      <VideoRow
                        title="Lançamentos Recentes"
                        videos={videos.slice(0, 8)}
                        categories={categories}
                        onSelectVideo={handleSelectVideo}
                        rowId="row-launches"
                      />

                      {/* Category Rows */}
                      {categoriesWithVideos.map((item) => (
                        <VideoRow
                          key={item.category.id}
                          title={item.category.name}
                          videos={item.videos}
                          categories={categories}
                          onSelectVideo={handleSelectVideo}
                          rowId={`row-cat-${item.category.id}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* CATEGORIES BROWSER VIEW */}
                  {currentView === 'categories' && (
                    <CategoryView
                      categories={categories}
                      videos={videos}
                      onSelectVideo={handleSelectVideo}
                    />
                  )}

                  {/* SEARCH VIEW */}
                  {currentView === 'search' && (
                    <SearchView
                      videos={videos}
                      categories={categories}
                      onSelectVideo={handleSelectVideo}
                    />
                  )}
                </>
              )}
            </main>

            {/* Public Footer */}
            <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-6 text-center text-xs text-zinc-500 space-y-2">
              <p className="font-semibold text-zinc-400">
                CineStream VOD — Plataforma Otimizada para Smart TVs e Navegadores Web
              </p>
              <p>Navegação por Controle Remoto (Setas Direcionais, OK / Enter e Voltar)</p>
            </footer>
          </div>
        )}
      </div>
    </FocusProvider>
  );
}
