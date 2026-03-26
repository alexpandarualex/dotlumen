import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  History, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Filter, 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2, 
  Plus, 
  FileText, 
  Globe, 
  Database, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Info, 
  ExternalLink,
  Trash2,
  Save,
  Archive,
  ArrowRight,
  Sparkles,
  Bot,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  MoreVertical,
  Layers,
  Briefcase,
  FileCode,
  LineChart as LineChartIcon,
  Target,
  Search as SearchIcon,
  Video,
  FileCheck,
  FileSearch,
  PenTool,
  Presentation,
  Image as ImageIcon,
  Rss,
  Map,
  Lightbulb,
  Mail,
  FileSignature,
  TrendingUp,
  Gavel,
  Scale,
  Stethoscope,
  Heart,
  GraduationCap,
  Building2,
  Globe2,
  Cpu,
  Smartphone,
  Headphones,
  Eye,
  Navigation,
  Accessibility,
  MessageSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GoogleGenAI, 
  GenerateContentResponse, 
  Modality, 
  LiveServerMessage,
  FunctionDeclaration,
  Type
} from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast, Toaster } from 'sonner';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer, 
  Timestamp 
} from 'firebase/firestore';

// Constants & Types
import { AGENTS } from './constants';
import { Agent, ChatMessage, AgentFile, AgentSession, OperationType, FirestoreErrorInfo } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

// Initialize AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is missing. AI features will not work.');
}
const ai = new GoogleGenAI({ apiKey: apiKey || 'missing-key' });

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  collapsed 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void,
  collapsed: boolean
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300")} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
);

const AgentCard = ({ agent, onClick }: { agent: Agent, onClick: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.02 }}
    onClick={onClick}
    className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 cursor-pointer hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight className="w-5 h-5 text-teal-400" />
    </div>
    
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-teal-500/20 transition-colors">
        {agent.icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-teal-500 tracking-widest uppercase">
            {agent.number}
          </span>
          {agent.priority === 'HIGH' && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[8px] font-bold uppercase tracking-wider border border-red-500/20">
              High Priority
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-100 group-hover:text-teal-400 transition-colors leading-tight">
          {agent.title}
        </h3>
      </div>
    </div>
    
    <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">
      {agent.useCase}
    </p>
    
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/30">
        {agent.category}
      </span>
    </div>
  </motion.div>
);

const VisualSummary = ({ data }: { data: any }) => {
  const radarData = [
    { subject: 'Market Fit', A: 120, fullMark: 150 },
    { subject: 'Innovation', A: 98, fullMark: 150 },
    { subject: 'Feasibility', A: 86, fullMark: 150 },
    { subject: 'Impact', A: 99, fullMark: 150 },
    { subject: 'Scalability', A: 85, fullMark: 150 },
    { subject: 'Risk', A: 65, fullMark: 150 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          Strategic Analysis
        </h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Agent Analysis"
                dataKey="A"
                stroke="#2dd4bf"
                fill="#2dd4bf"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-400" />
          Market Sentiment
        </h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={[
              { name: 'Positive', value: 65 },
              { name: 'Neutral', value: 25 },
              { name: 'Negative', value: 10 },
            ]}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis hide />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#2dd4bf' }}
              />
              <Bar dataKey="value" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ArchiveGrid = ({ reports, onSelect }: { reports: any[], onSelect: (r: any) => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {reports.map((report) => (
      <motion.div
        key={report.id}
        whileHover={{ scale: 1.02 }}
        onClick={() => onSelect(report)}
        className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-teal-500/40 transition-all group"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-teal-500/20 transition-colors">
            <Archive className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {format(report.date?.toDate() || new Date(), 'MMM d, yyyy')}
          </span>
        </div>
        <h4 className="font-bold text-slate-200 text-sm mb-2 line-clamp-1">
          {report.title || 'Raport dotLumen'}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4">
          {report.summary || (report.content ? report.content.substring(0, 100) + '...' : 'Fără rezumat disponibil.')}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {report.agentName || 'General'}
          </span>
          <ArrowRight className="w-3 h-3 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    ))}
  </div>
);

// --- Main Application ---

export default function VisionaryResearchApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<AgentFile[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingTranscript, setMeetingTranscript] = useState<{role: string, text: string, timestamp: Date}[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'archive' | 'settings'>('grid');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioInputRef = useRef<AudioNode | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const transcriptRef = useRef<{role: string, text: string, timestamp: Date}[]>([]);
  const isRecordingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);

  // Categories derived from AGENTS
  const categories = useMemo(() => {
    const cats = Array.from(new Set(AGENTS.map(a => a.category)));
    return ['All', ...cats];
  }, []);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return AGENTS.filter(agent => {
      const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
      const matchesSearch = agent.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           agent.useCase.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Reports from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'reports'), orderBy('date', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(docs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'reports'));
    return () => unsubscribe();
  }, [user]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid || 'anonymous',
        email: auth.currentUser?.email || 'none',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || true,
        tenantId: auth.currentUser?.tenantId || 'none',
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName || 'none',
          email: provider.email || 'none',
          photoUrl: provider.photoURL || 'none'
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    toast.error(`Database Error: ${errInfo.error}`);
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    toast.promise(
      fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).then(async res => {
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        const newFiles: AgentFile[] = data.files.map((f: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          type: f.type,
          content: f.content,
          size: 'Parsed'
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        return data;
      }),
      {
        loading: 'Processing files...',
        success: 'Files uploaded and parsed successfully',
        error: 'Failed to upload files'
      }
    );
  };

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const searchGooglePatents = async (q: string, page: number = 0) => {
    try {
      const response = await fetch('/api/patents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, page })
      });
      if (!response.ok) throw new Error('Patent search failed');
      return await response.json();
    } catch (error) {
      console.error('Error searching patents:', error);
      return { error: 'Failed to search patents' };
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    if (!apiKey) {
      toast.error('AI API Key is missing. Chat unavailable.');
      return;
    }
    
    const textToMessage = overrideText || inputText;
    console.log('Sending message...', { textToMessage, filesCount: uploadedFiles.length });
    
    if (!textToMessage.trim() && uploadedFiles.length === 0) return;
    if (!selectedAgent) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToMessage,
      timestamp: new Date(),
      files: [...uploadedFiles]
    };

    setChatMessages(prev => [...prev, userMessage]);
    if (!overrideText) setInputText('');
    setUploadedFiles([]);
    setIsTyping(true);

    try {
      // Prepare context from files
      const fileContext = userMessage.files?.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n\n') || '';
      const fullPrompt = `${selectedAgent.systemPrompt}\n\nUSER CONTEXT/FILES:\n${fileContext}\n\nUSER MESSAGE: ${textToMessage}`;

      console.log('Calling AI with prompt length:', fullPrompt.length);
      
      const patentSearchTool: FunctionDeclaration = {
        name: "searchGooglePatents",
        description: "Search for patents using Google Patents via SerpApi. Returns structured patent data including titles, snippets, patent numbers, and links.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            q: {
              type: Type.STRING,
              description: "The search query for patents (e.g., 'assistive technology for blind users')"
            },
            page: {
              type: Type.INTEGER,
              description: "The page number for results (default 0)"
            }
          },
          required: ["q"]
        }
      };

      const tools: any[] = [{ googleSearch: {} }];
      if (selectedAgent.id === '06') {
        tools.push({ functionDeclarations: [patentSearchTool] });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: fullPrompt,
        config: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          tools: tools,
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      console.log('AI Response received:', response);

      // Handle function calls if any
      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'searchGooglePatents') {
            const { q, page } = call.args as any;
            const results = await searchGooglePatents(q, page);
            
            // Send results back to AI
            const secondResponse = await ai.models.generateContent({
              model: "gemini-3.1-pro-preview",
              contents: [
                { role: 'user', parts: [{ text: fullPrompt }] },
                { role: 'model', parts: [{ functionCall: call }] },
                { role: 'user', parts: [{ functionResponse: { name: 'searchGooglePatents', response: results, id: call.id } }] }
              ],
              config: {
                tools: tools,
                toolConfig: { includeServerSideToolInvocations: true }
              }
            });
            
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: secondResponse.text || "I'm sorry, I couldn't generate a response after searching patents.",
              timestamp: new Date()
            };

            setChatMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
            return;
          }
        }
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      
      // Save to history if logged in
      if (user) {
        try {
          await addDoc(collection(db, 'chat_history'), {
            userId: user.uid,
            agentId: selectedAgent.id,
            message: userMessage,
            response: aiMessage,
            timestamp: Timestamp.now()
          });

          // If this was a report generation request, save to reports collection too
          if (isGeneratingReport) {
            await addDoc(collection(db, 'reports'), {
              title: `Raport ${selectedAgent.title} - ${format(new Date(), 'HH:mm')}`,
              agentId: selectedAgent.id,
              agentName: selectedAgent.title,
              userId: user.uid,
              content: aiMessage.content,
              summary: aiMessage.content.substring(0, 200).replace(/[#*`]/g, '') + '...',
              date: Timestamp.now(),
              type: 'AI Generated'
            });
            toast.success('Analiza a fost salvată în arhivă.');
            setIsGeneratingReport(false);
          }
        } catch (dbError) {
          console.error('Error saving to history/reports:', dbError);
        }
      }

    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(`AI Error: ${error.message || 'Communication failed'}`);
      // Restore input if it failed
      if (!overrideText) setInputText(textToMessage);
      setIsGeneratingReport(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpenReport = (report: any) => {
    const agent = AGENTS.find(a => a.id === report.agentId) || AGENTS[0];
    setSelectedAgent(agent);
    setChatMessages([
      {
        id: 'report-content',
        role: 'assistant',
        content: report.content,
        timestamp: report.date?.toDate() || new Date()
      }
    ]);
    toast.success(`Raportul "${report.title}" a fost încărcat.`);
  };

  const handleGenerateReport = () => {
    if (!selectedAgent) return;
    setIsGeneratingReport(true);
    const prompt = chatMessages.length > 0 
      ? "Vă rog să generați un raport detaliat de cercetare bazat pe conversația noastră de până acum, incluzând obiectivele, descoperirile cheie și recomandările strategice."
      : "Vă rog să generați un raport de structură inițială pentru cercetarea vizionară dotLumen, bazat pe expertiza voastră.";
    
    handleSendMessage(prompt);
  };

  const handleStartRecording = async () => {
    if (!isLiveMode) {
      await toggleLiveMode();
    }
    setIsRecording(true);
    isRecordingRef.current = true;
    transcriptRef.current = [];
    setMeetingTranscript([]);
    toast.success('Înregistrare pornită');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    toast.info('Înregistrare oprită');
  };

  const handleGenerateMinutes = () => {
    if (meetingTranscript.length === 0) {
      toast.error('Nu există transcriere pentru a genera minuta.');
      return;
    }
    
    setIsGeneratingReport(true);
    const transcriptText = meetingTranscript.map(t => `${t.role}: ${t.text}`).join('\n');
    const prompt = `Vă rog să generați minuta ședinței bazată pe următoarea transcriere. Rezumatul trebuie să includă cele mai importante subiecte discutate, deciziile luate și acțiunile următoare.\n\nTRANSCRIERE:\n${transcriptText}`;
    
    handleSendMessage(prompt);
  };

  const handleExportDOCX = async () => {
    if (!selectedAgent || chatMessages.length === 0) {
      toast.error('Nu există conținut pentru export.');
      return;
    }

    const lastAiMessage = [...chatMessages].reverse().find(m => m.role === 'assistant');
    if (!lastAiMessage) {
      toast.error('Nu am găsit niciun raport generat de AI pentru export.');
      return;
    }

    toast.promise(
      async () => {
        const title = `Raport dotLumen - ${selectedAgent.title}`;
        const content = lastAiMessage.content;

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "dotLumen Visionary Research",
                      bold: true,
                      size: 32,
                      color: "1B4F5C",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Raport de Inteligență Strategică / Minută Ședință",
                      bold: true,
                      size: 24,
                      color: "3AACCA",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 600 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Agent: ", bold: true }),
                    new TextRun({ text: selectedAgent.title }),
                  ],
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Data: ", bold: true }),
                    new TextRun({ text: format(new Date(), 'PPP', { locale: ro }) }),
                  ],
                  spacing: { after: 800 },
                }),
                ...content.split('\n').map(line => {
                  const isHeading = line.startsWith('#');
                  const cleanLine = line.replace(/#/g, '').trim();
                  
                  if (!cleanLine) return new Paragraph({ text: "" });

                  return new Paragraph({
                    children: [
                      new TextRun({ 
                        text: cleanLine,
                        bold: isHeading,
                        size: isHeading ? 24 : 20,
                        color: isHeading ? "1B4F5C" : "334155"
                      })
                    ],
                    spacing: { after: 200, before: isHeading ? 400 : 0 },
                    heading: isHeading ? HeadingLevel.HEADING_3 : undefined,
                  });
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "© 2026 dotLumen (.lumen) - Confidențial - Uz Intern",
                      size: 16,
                      color: "999999",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 1000 },
                }),
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Raport_dotLumen_${selectedAgent.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.docx`);
      },
      {
        loading: 'Generăm documentul DOCX...',
        success: 'Document DOCX descărcat!',
        error: 'Eroare la generarea DOCX.'
      }
    );
  };

  const handleExportPDF = async () => {
    if (!selectedAgent) {
      toast.error('Vă rugăm să selectați un agent.');
      return;
    }

    if (chatMessages.length === 0) {
      toast.error('Nu există mesaje de exportat.');
      return;
    }
    
    toast.promise(
      async () => {
        // Create a clean version of the chat for PDF
        const element = document.createElement('div');
        element.style.padding = '40px';
        element.style.backgroundColor = '#ffffff';
        element.style.color = '#000000';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.width = '800px'; // Fixed width for consistent rendering
        
        const agentTitle = selectedAgent?.title || 'dotLumen';
        const header = document.createElement('div');
        header.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1B4F5C; padding-bottom: 15px; margin-bottom: 25px;">
            <div>
              <h1 style="color: #1B4F5C; margin: 0; font-size: 24px;">dotLumen Visionary Research</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Raport de Inteligență Strategică</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold; color: #1B4F5C;">${agentTitle}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">${format(new Date(), 'PPP', { locale: ro })}</p>
            </div>
          </div>
        `;
        element.appendChild(header);
        
        chatMessages.forEach(msg => {
          const msgDiv = document.createElement('div');
          msgDiv.style.marginBottom = '25px';
          msgDiv.style.padding = '15px';
          msgDiv.style.borderRadius = '8px';
          msgDiv.style.backgroundColor = msg.role === 'user' ? '#f8fafc' : '#ffffff';
          msgDiv.style.border = msg.role === 'user' ? '1px solid #e2e8f0' : 'none';
          
          msgDiv.innerHTML = `
            <p style="font-weight: bold; color: ${msg.role === 'user' ? '#1B4F5C' : '#3AACCA'}; margin-top: 0; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              ${msg.role === 'user' ? 'Cercetător' : 'dotLumen AI'}:
            </p>
            <div style="white-space: pre-wrap; line-height: 1.6; font-size: 13px; color: #334155;">${msg.content}</div>
          `;
          element.appendChild(msgDiv);
        });

        const footer = document.createElement('div');
        footer.style.marginTop = '40px';
        footer.style.paddingTop = '20px';
        footer.style.borderTop = '1px solid #eee';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '10px';
        footer.style.color = '#999';
        footer.innerHTML = `
          <p>© 2026 dotLumen (.lumen) - Toate drepturile rezervate. Generat prin Visionary Research Platform.</p>
          <p>Confidențial - Uz Intern</p>
        `;
        element.appendChild(footer);

        // Temporarily append to body to ensure styles are calculated correctly
        document.body.appendChild(element);
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '0';

        const safeTitle = agentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const opt = {
          margin: 15,
          filename: `Raport_dotLumen_${safeTitle}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false,
            letterRendering: true
          },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        try {
          // Robust way to call html2pdf regardless of import style
          const h2p = (html2pdf as any).default || html2pdf;
          if (typeof h2p === 'function') {
            await h2p().set(opt).from(element).save();
          } else {
            throw new Error('Biblioteca PDF nu a putut fi inițializată.');
          }
        } finally {
          document.body.removeChild(element);
        }
      },
      {
        loading: 'Pregătim raportul PDF...',
        success: 'Raport descărcat cu succes!',
        error: (err) => `Eroare: ${err.message || 'Eroare la generarea PDF-ului.'}`
      }
    );
  };

  const handleShareIntelligence = async () => {
    if (!selectedAgent) {
      toast.error('Vă rugăm să selectați un agent.');
      return;
    }

    // Use the Shared App URL if available, otherwise fallback to current URL
    const shareUrl = "https://ais-pre-6e3e5wqlm4yjtmdfkvl5no-300292237305.europe-west2.run.app";
    const shareData = {
      title: `dotLumen Visionary Research: ${selectedAgent.title}`,
      text: `Analiză strategică generată de dotLumen AI folosind agentul ${selectedAgent.title}.`,
      url: shareUrl
    };

    const copyToClipboard = async (text: string) => {
      try {
        // Try modern API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
        
        // Fallback for non-secure contexts or iframes
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        let successful = false;
        try {
          successful = document.execCommand('copy');
        } catch (err) {
          console.error('execCommand fallback failed:', err);
        }
        
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error('Copy failed:', err);
        return false;
      }
    };

    try {
      // Check if Web Share API is available and not blocked
      if (navigator.share && typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Partajare reușită!');
      } else {
        throw new Error('Web Share API not available or blocked');
      }
    } catch (err) {
      console.log('Falling back to clipboard copy...');
      const success = await copyToClipboard(shareUrl);
      if (success) {
        toast.success('Link-ul de cercetare a fost copiat în clipboard!');
      } else {
        toast.error('Nu s-a putut copia link-ul. Vă rugăm să copiați manual adresa din browser.');
      }
    }
  };

  const toggleLiveMode = async () => {
    if (!apiKey) {
      toast.error('AI API Key is missing. Voice mode unavailable.');
      return;
    }
    if (isLiveMode) {
      stopLiveMode();
      return;
    }

    try {
      // 1. Initialize Audio Context at 24kHz for better quality
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // 2. Connect to Gemini Live
      const systemInstruction = `
        Ești dotLumen AI, o prezență feminină caldă, inteligentă și extrem de empatică. 
        Rolul tău este de asistent de cercetare vizionară pentru .lumen (dotLumen).
        
        REGULI DE COMUNICARE:
        1. Vorbește EXCLUSIV în limba română, cu o intonație naturală și un accent bucureștean curat.
        2. Vocea ta trebuie să sune uman, nu robotic. Folosește pauze naturale și o cadență prietenoasă.
        3. Ești expertă în tehnologie asistivă și inovație care ajută oamenii.
        4. Răspunsurile tale trebuie să fie concise (maxim 2-3 propoziții) pentru a menține latența scăzută.
        5. Evită formulele de politețe excesive sau introducerile lungi de tipul "Bună, sunt dotLumen...". Treci direct la esență.
        
        CONTEXT: ${selectedAgent?.systemPrompt || "Ești pregătită să ajuți cu cercetarea."}
      `.trim();

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            setIsLiveMode(true);
            toast.success('Sesiune vocală activă');
            sessionPromise.then(session => startMicrophone(session));
          },
          onmessage: async (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.text && isRecordingRef.current) {
                  const role = isAiSpeakingRef.current ? 'AI' : 'User';
                  transcriptRef.current.push({ role, text: part.text, timestamp: new Date() });
                  setMeetingTranscript([...transcriptRef.current]);
                }
                if (part.inlineData?.data) {
                  setIsAiSpeaking(true);
                  isAiSpeakingRef.current = true;
                  playReceivedAudio(part.inlineData.data, 24000);
                }
              }
            }
            if (message.serverContent?.interrupted) {
              stopPlayback();
              setIsAiSpeaking(false);
              isAiSpeakingRef.current = false;
            }
          },
          onclose: () => stopLiveMode(),
          onerror: (err) => {
            console.error('Live Error:', err);
            stopLiveMode();
            toast.error('Eroare sesiune vocală');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: "Zephyr" // High-quality female voice
              } 
            }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      const session = await sessionPromise;
      liveSessionRef.current = session;
    } catch (error) {
      console.error('Failed to start live session:', error);
      toast.error('Microphone access or AI connection failed');
    }
  };

  const startMicrophone = async (session: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const audioCtx = audioContextRef.current!;
      const source = audioCtx.createMediaStreamSource(stream);
      audioInputRef.current = source;

      // Use ScriptProcessorNode with smaller buffer for lower latency (1024 for better balance)
      const processor = audioCtx.createScriptProcessor(1024, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Simple user speaking detection
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setIsUserSpeaking(rms > 0.01);

        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Convert to Base64
        const uint8Array = new Uint8Array(pcmData.buffer);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Data = btoa(binary);

        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
        });
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (error) {
      console.error('Microphone access failed:', error);
      toast.error('Could not access microphone');
      stopLiveMode();
    }
  };

  const playReceivedAudio = (base64Data: string, sampleRate: number = 24000) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    // Decode Base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert Int16 PCM to Float32
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const audioBuffer = audioCtx.createBuffer(1, floatData.length, sampleRate);
    audioBuffer.getChannelData(0).set(floatData);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    
    source.onended = () => {
      // Check if this was the last scheduled buffer
      if (audioCtx.currentTime >= nextPlaybackTimeRef.current - 0.1) {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
      }
    };

    // Schedule playback for gapless audio
    const currentTime = audioCtx.currentTime;
    const startTime = Math.max(currentTime, nextPlaybackTimeRef.current);
    source.start(startTime);
    nextPlaybackTimeRef.current = startTime + audioBuffer.duration;
  };

  const stopPlayback = () => {
    nextPlaybackTimeRef.current = 0;
    // In a more advanced version, we'd track and stop all active sources
  };

  const stopLiveMode = () => {
    setIsLiveMode(false);
    liveSessionRef.current?.close();
    liveSessionRef.current = null;

    processorNodeRef.current?.disconnect();
    processorNodeRef.current = null;
    
    audioInputRef.current?.disconnect();
    audioInputRef.current = null;

    audioStreamRef.current?.getTracks().forEach(track => track.stop());
    audioStreamRef.current = null;
    
    nextPlaybackTimeRef.current = 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-teal-500 font-mono text-sm tracking-widest animate-pulse">INITIALIZING VISIONARY SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-teal-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-teal-500/20">
              <Sparkles className="w-10 h-10 text-teal-400" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Visionary Research</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              The professional AI intelligence platform for dotLumen's next generation of assistive technology.
            </p>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-teal-400 transition-all duration-300 shadow-xl shadow-teal-500/10"
          >
            <Globe className="w-5 h-5" />
            Continue with Google
          </button>
          
          <p className="text-center mt-8 text-slate-600 text-xs">
            Authorized access only. By continuing, you agree to dotLumen's security protocols and data usage policies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex overflow-hidden font-sans">
      <Toaster position="top-right" theme="dark" />
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-slate-900/40 border-r border-slate-800 flex flex-col z-30 relative"
      >
        <div className="p-6 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-black text-black text-sm">
                .L
              </div>
              <span className="font-black text-lg tracking-tighter text-white">VISIONARY</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          <SidebarItem 
            icon={LayoutGrid} 
            label="Agent Playbook" 
            active={view === 'grid'} 
            onClick={() => setView('grid')} 
            collapsed={sidebarCollapsed} 
          />
          <SidebarItem 
            icon={Archive} 
            label="Research Archive" 
            active={view === 'archive'} 
            onClick={() => setView('archive')} 
            collapsed={sidebarCollapsed} 
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="Market Intel" 
            onClick={() => toast.info('Coming soon')} 
            collapsed={sidebarCollapsed} 
          />
          
          <div className="pt-8 pb-4">
            {!sidebarCollapsed && <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Categories</p>}
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-xl transition-all text-sm",
                  activeCategory === cat ? "text-teal-400 bg-teal-500/5" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", activeCategory === cat ? "bg-teal-400" : "bg-slate-700")} />
                {!sidebarCollapsed && <span>{cat}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30", sidebarCollapsed && "justify-center")}>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-slate-700"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="p-2 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-xl z-20">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search intelligence agents, use cases, or research topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative">
              <History className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-[#050505]" />
            </button>
            <button className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Research
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-teal-400" />
                    <h2 className="text-2xl font-black text-white tracking-tight">Intelligence Playbook</h2>
                  </div>
                  <p className="text-slate-400 text-sm">Select a specialized AI agent to begin your research or business task.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAgents.map(agent => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      onClick={() => {
                        setSelectedAgent(agent);
                        setChatMessages([]);
                      }} 
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="archive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Archive className="w-5 h-5 text-teal-400" />
                    <h2 className="text-2xl font-black text-white tracking-tight">Research Archive</h2>
                  </div>
                  <p className="text-slate-400 text-sm">Historical intelligence reports and AI-generated strategic documents.</p>
                </div>
                
                <ArchiveGrid reports={reports} onSelect={handleOpenReport} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[#050505]/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black"
            >
              {/* Modal Header */}
              <div className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-xl">
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedAgent.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{selectedAgent.number}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[10px] text-slate-500">{selectedAgent.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isLiveMode && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 border rounded-xl transition-all duration-300",
                      isAiSpeaking ? "bg-teal-500/10 border-teal-500/20" : "bg-red-500/10 border-red-500/20"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isAiSpeaking ? "bg-teal-500 animate-pulse" : "bg-red-500"
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isAiSpeaking ? "text-teal-500" : "text-red-500"
                      )}>
                        {isAiSpeaking ? "AI Vorbește" : "Live Voice"}
                      </span>
                      {isUserSpeaking && !isAiSpeaking && (
                        <div className="flex gap-0.5 ml-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-0.5 h-2 bg-red-500/50 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={toggleLiveMode}
                    className={cn(
                      "p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold",
                      isLiveMode 
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    )}
                  >
                    {isLiveMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    {isLiveMode ? "LIVE SESSION" : "VOICE MODE"}
                  </button>
                  <button 
                    onClick={() => setSelectedAgent(null)}
                    className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#050505]/40 relative">
                  <div 
                    id="chat-messages-container"
                    className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide"
                  >
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/20">
                          <Bot className="w-8 h-8 text-teal-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Initialize Research</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                          I'm ready to assist with {selectedAgent.title.toLowerCase()}. You can upload documents or start by describing your task.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <button 
                            onClick={() => {
                              setInputText("Analyze the current market trends for dotLumen and assistive technology.");
                              setTimeout(handleSendMessage, 0);
                            }}
                            className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:border-teal-500/40 transition-all"
                          >
                            Analyze Market
                          </button>
                          <button 
                            onClick={() => {
                              setInputText("Draft a research proposal for a new assistive technology project.");
                              setTimeout(handleSendMessage, 0);
                            }}
                            className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:border-teal-500/40 transition-all"
                          >
                            Draft Proposal
                          </button>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex gap-4 max-w-4xl",
                          msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          msg.role === 'user' ? "bg-teal-500 text-black" : "bg-slate-800 text-teal-400"
                        )}>
                          {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={cn(
                          "space-y-2",
                          msg.role === 'user' ? "text-right" : ""
                        )}>
                          <div className={cn(
                            "p-4 rounded-2xl text-sm leading-relaxed",
                            msg.role === 'user' 
                              ? "bg-teal-500 text-black font-medium" 
                              : "bg-slate-800/50 border border-slate-800 text-slate-200"
                          )}>
                            <div className="markdown-body">
                              <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                            </div>
                            
                            {msg.files && msg.files.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-black/10 flex flex-wrap gap-2">
                                {msg.files.map(f => (
                                  <div key={f.id} className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-md text-[10px] font-bold">
                                    <FileText className="w-3 h-3" />
                                    {f.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-600 font-mono">
                            {format(msg.timestamp, 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl flex gap-1">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-8 bg-slate-900/80 backdrop-blur-md border-t border-slate-800">
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {uploadedFiles.map(file => (
                          <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-400 font-medium group">
                            <FileText className="w-3 h-3" />
                            {file.name}
                            <button 
                              onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                              className="hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative flex items-end gap-4">
                      <div className="flex-1 relative">
                        <textarea
                          rows={1}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder={`Message ${selectedAgent.title}...`}
                          className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-4 pr-24 text-sm focus:outline-none focus:border-teal-500/50 transition-all resize-none scrollbar-hide"
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-500 hover:text-teal-400 transition-colors"
                          >
                            <Paperclip className="w-5 h-5" />
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            multiple 
                            className="hidden" 
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim() && uploadedFiles.length === 0}
                        className="p-4 bg-teal-500 text-black rounded-2xl hover:bg-teal-400 transition-all disabled:opacity-50 disabled:hover:bg-teal-500 shadow-lg shadow-teal-500/20"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Sidebar */}
                <div className="w-80 border-l border-slate-800 bg-slate-900/50 overflow-y-auto p-6 scrollbar-hide hidden lg:block">
                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Agent Capabilities</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 leading-relaxed">{selectedAgent.useCase}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Visual Insights</h4>
                    <VisualSummary data={null} />
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      {selectedAgent.id === '07' ? (
                        <>
                          {!isRecording ? (
                            <button 
                              onClick={handleStartRecording}
                              className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs font-bold text-red-400 flex items-center justify-between transition-all group border border-red-500/20"
                            >
                              Start Recording
                              <Mic className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                            </button>
                          ) : (
                            <button 
                              onClick={handleStopRecording}
                              className="w-full p-3 bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-all animate-pulse"
                            >
                              Stop Recording
                              <Square className="w-4 h-4 fill-current" />
                            </button>
                          )}
                          <button 
                            onClick={handleGenerateMinutes}
                            disabled={meetingTranscript.length === 0 || isTyping}
                            className="w-full p-3 bg-teal-500 hover:bg-teal-400 rounded-xl text-xs font-bold text-black flex items-center justify-between transition-all group disabled:opacity-50"
                          >
                            Generează Minuta
                            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button 
                            onClick={handleExportDOCX}
                            className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-between transition-all group"
                          >
                            Export to DOCX
                            <FileText className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={handleGenerateReport}
                          className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-between transition-all group"
                        >
                          Generate Report
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                        </button>
                      )}
                      <button 
                        onClick={handleExportPDF}
                        className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-between transition-all group"
                      >
                        Export to PDF
                        <Download className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                      </button>
                      <button 
                        onClick={handleShareIntelligence}
                        className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-between transition-all group"
                      >
                        Share Intelligence
                        <Share2 className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
