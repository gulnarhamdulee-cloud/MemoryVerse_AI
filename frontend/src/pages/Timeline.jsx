import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  FileText,
  Activity,
  List,
  Grid,
  HardDrive,
  FileImage,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Timeline() {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'feed' | 'grouped'
  const [groupBy, setGroupBy] = useState('date'); // 'date' | 'month' | 'year' | 'title' | 'people' | 'locations' | 'emotions'
  
  // Filters
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  
  // Data states
  const [timelineData, setTimelineData] = useState({ activity_feed: [], grouped: {} });
  const [availableFilters, setAvailableFilters] = useState({
    tags: [],
    people: [],
    locations: [],
    emotions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch timeline data from FastAPI
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = { group_by: groupBy };
      if (selectedTag !== 'all') params.tag = selectedTag;
      if (selectedPerson !== 'all') params.person = selectedPerson;
      if (selectedLocation !== 'all') params.location = selectedLocation;
      if (selectedEmotion !== 'all') params.emotion = selectedEmotion;

      const res = await axios.get(`${API_URL}/api/timeline`, { params });
      setTimelineData(res.data);
      if (res.data.available_filters) {
        setAvailableFilters(res.data.available_filters);
      }
    } catch (err) {
      console.error('Error fetching timeline data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refresh-data', handleRefresh);
    return () => {
      window.removeEventListener('refresh-data', handleRefresh);
    };
  }, [groupBy, selectedTag, selectedPerson, selectedLocation, selectedEmotion]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filetype) => {
    if (!filetype) return <FileText className="w-4 h-4 text-purple-500" />;
    if (filetype.startsWith('image/')) {
      return <FileImage className="w-4 h-4 text-emerald-500" />;
    }
    if (filetype === 'application/pdf') {
      return <FileText className="w-4 h-4 text-rose-500" />;
    }
    if (filetype === 'text/plain') {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 text-purple-500" />;
  };

  // Grouped uploads logic (derived client side from filtered activities list)
  const getGroupedUploads = () => {
    const groups = {};
    (timelineData.activity_feed || []).forEach((item) => {
      let label = "Other Files";
      if (item.type.startsWith('image/')) label = 'Images';
      else if (item.type === 'application/pdf') label = 'PDFs';
      else if (item.type === 'text/plain') label = 'Text Files';
      else if (item.type.includes('word') || item.type.includes('document')) label = 'Documents';

      if (!groups[label]) {
        groups[label] = {
          count: 0,
          totalSize: 0,
          files: [],
          icon: getFileIcon(item.type)
        };
      }
      
      const sizeMatch = item.summary.match(/size (\d+) bytes/);
      const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
      
      groups[label].count += 1;
      groups[label].totalSize += size;
      groups[label].files.push(item);
    });
    return groups;
  };

  const groupedTimeline = timelineData.grouped || {};
  const groupedUploads = getGroupedUploads();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">Memory Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and reconstruct the chronological map of your digital assets.
          </p>
        </div>

        {/* View Toggles */}
        <div className="flex bg-secondary/80 p-1 rounded-lg border border-border self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'timeline'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Timeline Cards
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'feed'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Activity Feed
          </button>
          <button
            onClick={() => setViewMode('grouped')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'grouped'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grouped Uploads
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          {/* People Filter */}
          <div className="relative">
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
            >
              <option value="all">All People</option>
              {availableFilters.people.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
            >
              <option value="all">All Tags</option>
              {availableFilters.tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Locations Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
            >
              <option value="all">All Locations</option>
              {availableFilters.locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Emotions Filter */}
          <div className="relative">
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
            >
              <option value="all">All Emotions</option>
              {availableFilters.emotions.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Group By selector */}
          <div className="relative border-l border-border pl-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Group By:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary appearance-none cursor-pointer font-semibold text-primary"
            >
              <option value="date">Upload Date</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="title">Document Title</option>
              <option value="people">People</option>
              <option value="locations">Locations</option>
              <option value="emotions">Emotions</option>
            </select>
          </div>

          {(selectedTag !== 'all' || selectedPerson !== 'all' || selectedLocation !== 'all' || selectedEmotion !== 'all') && (
            <button
              onClick={() => {
                setSelectedTag('all');
                setSelectedPerson('all');
                setSelectedLocation('all');
                setSelectedEmotion('all');
              }}
              className="text-xs font-semibold text-primary hover:underline ml-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {timelineData.activity_feed.length} activities
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4 animate-pulse">
              <div className="w-24 h-4 bg-muted rounded" />
              <div className="flex gap-4">
                <div className="w-2 h-16 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="w-48 h-5 bg-muted rounded" />
                  <div className="w-full h-8 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : timelineData.activity_feed.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">No activity recorded</h3>
            <p className="text-xs text-muted-foreground mt-1">
              There are no uploads matching your current filter choices.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-96">
          <AnimatePresence mode="wait">
            
            {/* Timeline Cards View */}
            {viewMode === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {Object.entries(groupedTimeline).map(([periodTitle, items]) => (
                  <div key={periodTitle} className="space-y-4">
                    <h2 className="text-xs font-bold text-primary/80 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {periodTitle}
                    </h2>
                    <div className="border-l border-border pl-6 space-y-6 ml-2.5">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative group bg-card border border-border/80 hover:border-primary/20 p-5 rounded-xl transition-all shadow-sm"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[31px] top-6 w-2.5 h-2.5 rounded-full bg-border group-hover:bg-primary border-4 border-background transition-all" />
                          
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : ''}
                              </span>
                              <h3 className="font-semibold text-sm flex items-center gap-1.5 text-foreground mt-0.5">
                                {getFileIcon(item.type)}
                                {item.title}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                              
                              {/* Meta fields visualization */}
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold border border-primary/15">
                                    {tag}
                                  </span>
                                ))}
                                {item.people.map((p) => (
                                  <span key={p} className="text-[9px] bg-secondary/80 text-foreground px-1.5 py-0.5 rounded font-semibold border border-border">
                                    @{p}
                                  </span>
                                ))}
                                {item.locations.map((l) => (
                                  <span key={l} className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-semibold border border-indigo-500/20">
                                    📍 {l}
                                  </span>
                                ))}
                                {item.emotions.map((e) => (
                                  <span key={e} className="text-[9px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-semibold border border-rose-500/20 uppercase tracking-wider">
                                    {e}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded font-semibold uppercase tracking-wider text-muted-foreground self-start shrink-0 border border-border">
                              {item.type ? item.type.split('/')[1]?.toUpperCase() : 'FILE'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Activity Feed View */}
            {viewMode === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {timelineData.activity_feed.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="p-4 border border-border bg-card hover:bg-secondary/10 rounded-xl flex items-start gap-4 transition-all"
                  >
                    <div className="p-2 bg-secondary rounded-lg text-primary shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-bold truncate text-foreground flex items-center gap-1.5">
                          {getFileIcon(item.type)}
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Grouped Uploads View */}
            {viewMode === 'grouped' && (
              <motion.div
                key="grouped"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {Object.entries(groupedUploads).map(([category, data]) => (
                  <motion.div
                    key={category}
                    layout
                    className="bg-card border border-border rounded-xl p-5 space-y-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-secondary/80 rounded-lg">
                          {data.icon}
                        </div>
                        <h3 className="font-bold text-sm text-foreground">{category}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">{data.count} items</p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Total: {formatSize(data.totalSize)}
                        </p>
                      </div>
                    </div>

                    {/* Files in Category */}
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {data.files.map((file) => (
                        <div key={file.id} className="flex justify-between items-center text-xs p-2 bg-secondary/20 hover:bg-secondary/40 border border-border/40 rounded-lg transition-colors">
                          <span className="font-semibold text-foreground truncate max-w-[200px]" title={file.title}>
                            {file.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                            {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
