"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit2, Trash2, Save, X, Video, FileText, Lock, Unlock } from "lucide-react";

export default function VideoCoursesCMS() {
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Forms
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [lessonForm, setLessonForm] = useState({
    id: null,
    title: "",
    description: "",
    notes: "",
    video_url: "",
    reading_content: "",
    download_url: "",
    download_type: "",
    is_locked: false
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: secData, error: secErr } = await supabase
        .from('course_sections')
        .select('*')
        .order('sort_order', { ascending: true });
        
      const { data: lesData, error: lesErr } = await supabase
        .from('course_lessons')
        .select('*')
        .order('sort_order', { ascending: true });

      if (secData) setSections(secData);
      if (lesData) setLessons(lesData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      let error;
      if (editingSectionId) {
        const res = await supabase.from('course_sections').update({ title: newSectionTitle.trim() }).eq('id', editingSectionId);
        error = res.error;
      } else {
        const res = await supabase.from('course_sections').insert([{ title: newSectionTitle.trim(), sort_order: sections.length + 1 }]);
        error = res.error;
      }

      if (!error) {
        showNotice(editingSectionId ? "Section updated successfully!" : "Section added successfully!");
        setNewSectionTitle("");
        setEditingSectionId(null);
        setShowSectionForm(false);
        fetchData();
      } else {
        alert("Database Error: " + error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSection = (sec) => {
    setNewSectionTitle(sec.title);
    setEditingSectionId(sec.id);
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (id) => {
    if (!confirm("Delete this section and ALL its lessons?")) return;
    try {
      await supabase.from('course_sections').delete().eq('id', id);
      showNotice("Section deleted!");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim() || !selectedSectionId) return;
    try {
      const payload = {
        section_id: selectedSectionId,
        title: lessonForm.title,
        description: lessonForm.description,
        notes: lessonForm.notes,
        video_url: lessonForm.video_url,
        reading_content: lessonForm.reading_content,
        download_url: lessonForm.download_url,
        download_type: lessonForm.download_type,
        is_locked: lessonForm.is_locked
      };

      if (lessonForm.id) {
        const { error } = await supabase.from('course_lessons').update(payload).eq('id', lessonForm.id);
        if (error) { alert("Database Error: " + error.message); return; }
        showNotice("Lesson updated successfully!");
      } else {
        const order = lessons.filter(l => l.section_id === selectedSectionId).length + 1;
        payload.sort_order = order;
        const { error } = await supabase.from('course_lessons').insert([payload]);
        if (error) { alert("Database Error: " + error.message); return; }
        showNotice("Lesson created successfully!");
      }

      setLessonForm({ id: null, title: "", description: "", notes: "", video_url: "", reading_content: "", download_url: "", download_type: "", is_locked: false });
      setShowLessonForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditLesson = (les) => {
    setSelectedSectionId(les.section_id);
    setLessonForm({
      id: les.id,
      title: les.title || "",
      description: les.description || "",
      notes: les.notes || "",
      video_url: les.video_url || "",
      reading_content: les.reading_content || "",
      download_url: les.download_url || "",
      download_type: les.download_type || "",
      is_locked: les.is_locked || false
    });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (id) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await supabase.from('course_lessons').delete().eq('id', id);
      showNotice("Lesson deleted!");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#002D62]" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
        <div>
          <h2 className="text-lg font-bold text-[#002D62] font-serif flex items-center gap-2">
            <Video className="h-5 w-5 text-[#C5A059]" />
            Video Lessons Content Management
          </h2>
          <p className="text-xs text-[#666]">
            Upload video lessons, manage syllabus reading assignments, and organize lesson units.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSectionForm(true)} size="sm" className="bg-[#002D62] hover:bg-[#001F44] text-xs h-8">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Section
          </Button>
          <Button onClick={() => { setLessonForm({ id: null, title: "", description: "", notes: "", video_url: "", reading_content: "", download_url: "", download_type: "", is_locked: false }); setShowLessonForm(true); }} size="sm" className="bg-[#C5A059] hover:bg-[#b58f48] text-[#001F44] text-xs h-8">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
          {notice}
        </div>
      )}

      {showSectionForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-lg p-5 bg-white border-[#E5E5E5] shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#002D62]">{editingSectionId ? "Edit Section Title" : "New Section"}</h3>
              <button onClick={() => { setShowSectionForm(false); setEditingSectionId(null); setNewSectionTitle(""); }} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
                <input type="text" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002D62]" placeholder="e.g. Unit 1: Cyberspace" autoFocus />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button onClick={() => { setShowSectionForm(false); setEditingSectionId(null); setNewSectionTitle(""); }} size="sm" variant="outline" className="h-8 text-xs">Cancel</Button>
                <Button onClick={handleSaveSection} size="sm" className="bg-[#002D62] hover:bg-[#001F44] h-8 text-xs">{editingSectionId ? "Update Section" : "Save Section"}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showLessonForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-3xl p-5 bg-slate-50 border-[#E5E5E5] shadow-2xl space-y-4 my-auto relative">
          <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-[#002D62]">{lessonForm.id ? "Edit Lesson" : "New Lesson"}</h3>
            <button onClick={() => setShowLessonForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
          
          <div className="space-y-4">
            
            {/* Group 1: Basic Info */}
            <div className="p-3 bg-white border border-[#EAEAEA] rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-[#002D62] flex items-center gap-1.5 border-b border-[#F0F0F0] pb-2"><FileText className="h-3.5 w-3.5" /> 1. Basic Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Parent Section</label>
                  <select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)} className="w-full text-xs p-2 border border-slate-300 rounded bg-white">
                    <option value="">-- Select Section --</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Lesson Title</label>
                  <input type="text" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded" placeholder="e.g. 1. Intro to Cyberspace" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Short Description (Appears below title)</label>
                  <input type="text" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded" placeholder="Brief summary of this lesson..." />
                </div>
              </div>
            </div>

            {/* Group 2: Media */}
            <div className="p-3 bg-white border border-[#EAEAEA] rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-[#002D62] flex items-center gap-1.5 border-b border-[#F0F0F0] pb-2"><Video className="h-3.5 w-3.5" /> 2. Video Content</h4>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">YouTube Video URL</label>
                <input type="text" value={lessonForm.video_url} onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded" placeholder="e.g. https://www.youtube.com/watch?v=..." />
                <p className="text-[9px] text-slate-400">Just paste the standard YouTube link. We automatically convert it to a playable embed format for you.</p>
              </div>
            </div>

            {/* Group 3: Written Content */}
            <div className="p-3 bg-white border border-[#EAEAEA] rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-[#002D62] flex items-center gap-1.5 border-b border-[#F0F0F0] pb-2"><FileText className="h-3.5 w-3.5" /> 3. Written Content & Reading</h4>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Key Notes / Takeaways (Bullet points)</label>
                <textarea value={lessonForm.notes} onChange={e => setLessonForm({...lessonForm, notes: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded h-16" placeholder="• Key point 1\n• Key point 2" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Full Reading Material (Markdown/Text)</label>
                <textarea value={lessonForm.reading_content} onChange={e => setLessonForm({...lessonForm, reading_content: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded h-24" placeholder="Paste the full lecture reading or article here..." />
              </div>
            </div>

            {/* Group 4: Downloads */}
            <div className="p-3 bg-white border border-[#EAEAEA] rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-[#002D62] flex items-center gap-1.5 border-b border-[#F0F0F0] pb-2"><Save className="h-3.5 w-3.5" /> 4. Attached Files / Downloads</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Download URL (Google Drive, Dropbox, etc)</label>
                  <input type="text" value={lessonForm.download_url} onChange={e => setLessonForm({...lessonForm, download_url: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded" placeholder="e.g. https://link-to-file.pdf" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">File Type (PDF, PPT, TXT)</label>
                  <input type="text" value={lessonForm.download_type} onChange={e => setLessonForm({...lessonForm, download_type: e.target.value})} className="w-full text-xs p-2 border border-slate-300 rounded" placeholder="e.g. PDF" />
                </div>
              </div>
            </div>

            {/* Group 5: Access Control */}
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> 5. Access Control</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isLocked" 
                  checked={lessonForm.is_locked} 
                  onChange={e => setLessonForm({...lessonForm, is_locked: e.target.checked})} 
                  className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isLocked" className="text-xs font-semibold text-red-800">
                  Lock this lesson (Prevents students from viewing the video and content)
                </label>
              </div>
            </div>

          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveLesson} className="bg-[#002D62] hover:bg-[#001F44] text-xs h-8"><Save className="h-3.5 w-3.5 mr-1"/> Save Lesson</Button>
          </div>
        </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {sections.map(sec => {
          const secLessons = lessons.filter(l => l.section_id === sec.id);
          return (
            <Card key={sec.id} className="overflow-hidden border-[#E5E5E5] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="bg-[#F8FAFC] p-3 border-b border-[#EAEAEA] flex justify-between items-center shrink-0">
                <h3 className="font-bold text-[#002D62] text-sm">{sec.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEditSection(sec)} className="text-slate-500 hover:text-[#002D62] p-1"><Edit2 className="h-4 w-4"/></button>
                  <button onClick={() => handleDeleteSection(sec.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4"/></button>
                </div>
              </div>
              <div className="divide-y divide-[#EAEAEA] flex-1 overflow-y-auto max-h-[300px]">
                {secLessons.length === 0 ? (
                  <div className="p-6 text-xs text-slate-500 text-center italic">No lessons in this section yet.</div>
                ) : (
                  secLessons.map(les => (
                    <div key={les.id} className="p-3 bg-white flex justify-between items-start hover:bg-slate-50">
                      <div className="flex items-start gap-2 pr-2">
                        {les.is_locked ? <Lock className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" /> : <Video className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />}
                        <div className={`font-semibold text-xs leading-snug ${les.is_locked ? "text-slate-400" : "text-[#1E293B]"}`}>
                          {les.title}
                          {les.description && <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">{les.description}</div>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditLesson(les)} className="text-slate-400 hover:text-[#002D62] p-1"><Edit2 className="h-3.5 w-3.5"/></button>
                        <button onClick={() => handleDeleteLesson(les.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
