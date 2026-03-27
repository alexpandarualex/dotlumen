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
  Square,
  Sun,
  Moon
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
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  Header, 
  Footer, 
  PageNumber, 
  BorderStyle, 
  VerticalAlign,
  TableAnchorType,
  RelativeHorizontalPosition,
  RelativeVerticalPosition
} from 'docx';
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

const INITIAL_KEYWORDS = [
  "dotLumen", "Assistive Technology", "AI Research", "Strategic Innovation", 
  "Market Analysis", "Future Trends", "Human-Centered Design", "Wearable Tech", 
  "Accessibility", "Visionary Leadership", "Neural Engineering", "Mobility Solutions",
  "DeepTech Startup", "Medical Devices", "EU Funding", "CNAS Reimbursement",
  "Computer Vision", "Haptic Feedback", "Smart Glasses", "Disability Inclusion",
  "MedTech Innovation", "B2B Strategy", "Social Impact", "Global Expansion"
];

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

// Initialize AI
const getApiKey = () => process.env.GEMINI_API_KEY || 'AIzaSyAwTp1Zu7vp0a8c6WoBVKQk13YZZWZnBRU';

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
        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20" 
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
);

const LOGO_LIGHT = "/logo-black.jpg";
const LOGO_DARK = "/logo-white.jpg";

const AgentCard = ({ agent, onClick, theme, onLogoClick }: { agent: Agent, onClick: () => void, theme: 'light' | 'dark', onLogoClick: (e: React.MouseEvent) => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.02 }}
    onClick={onClick}
    className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 cursor-pointer hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
    </div>
    
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-teal-500/20 transition-colors">
        {agent.icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-500 tracking-widest uppercase">
            {agent.number}
          </span>
          <img 
            src={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT} 
            alt="dotLumen" 
            referrerPolicy="no-referrer"
            onClick={(e) => {
              e.stopPropagation();
              onLogoClick(e);
            }}
            className="h-4 opacity-60 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
          />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight">
          {agent.title}
        </h3>
      </div>
    </div>
    
    <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">
      {agent.useCase}
    </p>
    
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700/30">
        {agent.category}
      </span>
    </div>
  </motion.div>
);

const KnowledgeBase = ({ 
  items, 
  onAddLink, 
  onUploadFile,
  onRemoveItem 
}: { 
  items: any[], 
  onAddLink: (url: string) => void,
  onUploadFile: () => void,
  onRemoveItem: (id: string) => void
}) => {
  const [linkInput, setLinkInput] = useState('');

  const handleAddLink = () => {
    if (linkInput.trim()) {
      onAddLink(linkInput.trim());
      setLinkInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors duration-300">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Knowledge Base Enrichment
        </h4>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Add research link..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            />
            <button
              onClick={handleAddLink}
              className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-xl hover:bg-teal-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onUploadFile}
            className="w-full py-3 bg-slate-200/50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-teal-500/40 hover:text-teal-700 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Paperclip className="w-4 h-4" />
            Upload Research Documents
          </button>
        </div>

        {items.length > 0 && (
          <div className="mt-6 space-y-2">
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">Active Knowledge</h5>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg group transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.type === 'LINK' ? <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" /> : <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />}
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ArchiveGrid = ({ reports, onSelect, theme, onLogoClick }: { reports: any[], onSelect: (r: any) => void, theme: 'light' | 'dark', onLogoClick: () => void }) => (
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
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-medium text-slate-500">
              {format(report.date?.toDate() || new Date(), 'MMM d, yyyy')}
            </span>
            <img 
              src={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT} 
              alt="dotLumen" 
              referrerPolicy="no-referrer"
              onClick={(e) => {
                e.stopPropagation();
                onLogoClick();
              }}
              className="h-4 opacity-60 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
            />
          </div>
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

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

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
  const [knowledgeBase, setKnowledgeBase] = useState<(AgentFile | { id: string, type: 'LINK', name: string, content: string })[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingTranscript, setMeetingTranscript] = useState<{role: string, text: string, timestamp: Date}[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'archive' | 'settings'>('grid');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isNewResearchModalOpen, setIsNewResearchModalOpen] = useState(false);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kbFileInputRef = useRef<HTMLInputElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioInputRef = useRef<AudioNode | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const transcriptRef = useRef<{role: string, text: string, timestamp: Date}[]>([]);
  const isRecordingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const handleStartResearch = (keywords: string[]) => {
    setIsNewResearchModalOpen(false);
    // Select dotLumen Web Intel (#03) as default for general research
    const defaultAgent = AGENTS.find(a => a.id === 'doc-prod') || AGENTS[0];
    setSelectedAgent(defaultAgent);
    setChatMessages([]);
    const keywordString = keywords.join(', ');
    const initialPrompt = `I want to start a new strategic research about the following topics: ${keywordString}. Please provide an initial analysis and suggest a structure for a detailed report.`;
    handleSendMessage(initialPrompt);
    setCustomKeywords([]);
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

  const handleAddKnowledgeLink = async (url: string) => {
    toast.promise(
      fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      }).then(async res => {
        if (!res.ok) throw new Error('Failed to scrape link');
        const data = await res.json();
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'LINK' as const,
          name: url.replace(/^https?:\/\//, '').split('/')[0],
          content: data.content
        };
        setKnowledgeBase(prev => [...prev, newItem]);
        return data;
      }),
      {
        loading: 'Scraping link for knowledge base...',
        success: 'Link added to knowledge base',
        error: 'Failed to add link'
      }
    );
  };

  const handleKnowledgeFileUpload = (files: FileList | null) => {
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    toast.promise(
      fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).then(async res => {
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        const newFiles = data.files.map((f: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          type: 'FILE',
          name: f.name,
          content: f.content,
          size: 'Parsed'
        }));
        setKnowledgeBase(prev => [...prev, ...newFiles]);
        return data;
      }),
      {
        loading: 'Processing documents for knowledge base...',
        success: 'Documents added to knowledge base',
        error: 'Failed to add documents'
      }
    );
  };

  const handleRemoveKnowledgeItem = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
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
    const currentApiKey = getApiKey();
    if (!currentApiKey) {
      toast.error('AI API Key is missing. Chat unavailable.');
      return;
    }
    
    const ai = new GoogleGenAI({ apiKey: currentApiKey });
    
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
      // Prepare context from files and knowledge base
      const kbContext = knowledgeBase.map(item => `KNOWLEDGE_ITEM (${item.type}): ${item.name}\nCONTENT: ${item.content}`).join('\n\n');
      const fileContext = userMessage.files?.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n\n') || '';
      const fullPrompt = `${selectedAgent.systemPrompt}\n\nKNOWLEDGE BASE:\n${kbContext}\n\nUSER CONTEXT/FILES:\n${fileContext}\n\nUSER MESSAGE: ${textToMessage}`;

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
      if (selectedAgent.id === 'doc-prod' || selectedAgent.id === 'legal-ip') {
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
      const success = await toggleLiveMode();
      if (!success) return;
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
    
    // Auto-generate minutes for doc-prod agent
    if (selectedAgent?.id === 'doc-prod' && transcriptRef.current.length > 0) {
      setTimeout(() => {
        handleGenerateMinutes();
      }, 500);
    }
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
        const agentTitle = selectedAgent?.title || 'dotLumen';
        const reportName = `Raport ${agentTitle}`;
        const currentDate = format(new Date(), 'MM/dd/yyyy');
        const author = user?.email || '<enter author>';
        const docVersion = 'v1.0';
        const content = lastAiMessage.content;

        // Split content into roughly 4 parts
        const lines = content.split('\n').filter(l => l.trim());
        const linesPerSection = Math.max(1, Math.ceil(lines.length / 4));
        const sectionsData = [
          { title: 'Introduction', content: lines.slice(0, linesPerSection).join('\n') },
          { title: 'Analysis', content: lines.slice(linesPerSection, 2 * linesPerSection).join('\n') },
          { title: 'Strategic Insights', content: lines.slice(2 * linesPerSection, 3 * linesPerSection).join('\n') },
          { title: 'Conclusions', content: lines.slice(3 * linesPerSection).join('\n') }
        ];

        const doc = new Document({
          sections: [
            {
              headers: {
                default: new Header({
                  children: [
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                      },
                      rows: [
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [new TextRun({ text: `Report: ${reportName}`, size: 24 })]
                                })
                              ],
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({ text: "lumen", size: 36, bold: false, color: "000000" }),
                                  ],
                                  alignment: AlignmentType.RIGHT,
                                }),
                              ],
                              verticalAlign: VerticalAlign.CENTER,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              },
              footers: {
                default: new Footer({
                  children: [
                    new Paragraph({
                      border: { top: { style: BorderStyle.SINGLE, size: 1, color: "000000" } },
                      children: [
                        new TextRun({ text: docVersion, size: 20 }),
                        new TextRun({ children: ["\t", PageNumber.CURRENT, "\t"], size: 20 }),
                        new TextRun({ text: "[Internal]", size: 20 }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200 },
                    }),
                  ],
                }),
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Report: ${reportName}`, bold: true, size: 48 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 800, after: 800 },
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ text: "Doc version: ", bold: true }),
                                new TextRun({ text: docVersion }),
                              ],
                            }),
                          ],
                          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ text: "Date of version: ", bold: true }),
                                new TextRun({ text: currentDate }),
                              ],
                            }),
                          ],
                          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
                        }),
                      ],
                    }),
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ text: "Status of document: ", bold: true }),
                                new TextRun({ text: "Draft" }),
                              ],
                            }),
                          ],
                          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ text: "Author/Owner: ", bold: true }),
                                new TextRun({ text: author }),
                              ],
                            }),
                          ],
                          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
                        }),
                      ],
                    }),
                  ],
                }),
                new Paragraph({ text: "", spacing: { after: 400 } }),
                ...sectionsData.flatMap((sec, i) => [
                  new Paragraph({
                    children: [new TextRun({ text: `${i + 1}. ${sec.title}`, bold: true, size: 36 })],
                    spacing: { before: 400, after: 200 },
                  }),
                  ...sec.content.split('\n').map(line => new Paragraph({
                    children: [new TextRun({ text: line, size: 22 })],
                    spacing: { after: 150 },
                  })),
                ]),
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
        const agentTitle = selectedAgent?.title || 'dotLumen';
        const reportName = `Raport ${agentTitle}`;
        const currentDate = format(new Date(), 'MM/dd/yyyy');
        const author = user?.email || '<enter author>';
        const docVersion = 'v1.0';

        // Create a clean version of the chat for PDF matching the template
        const element = document.createElement('div');
        element.style.padding = '20mm';
        element.style.backgroundColor = '#ffffff';
        element.style.color = '#000000';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.width = '210mm'; // A4 width
        element.style.minHeight = '297mm'; // A4 height
        element.style.boxSizing = 'border-box';
        element.style.position = 'relative';
        
        // Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '5px';
        header.innerHTML = `
          <div style="font-size: 12pt; color: #000;">Report: ${reportName}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="display: grid; grid-template-columns: repeat(3, 4px); gap: 2px;">
              ${Array(9).fill(0).map((_, i) => `<div style="width: 4px; height: 4px; border-radius: 50%; background-color: ${i % 2 === 0 ? '#3AACCA' : '#1B4F5C'};"></div>`).join('')}
            </div>
            <span style="font-size: 18pt; font-weight: 300; letter-spacing: -1px; color: #000;">lumen</span>
          </div>
        `;
        element.appendChild(header);

        // Header Line
        const headerLine = document.createElement('div');
        headerLine.style.borderBottom = '1px solid #000';
        headerLine.style.marginBottom = '10px';
        element.appendChild(headerLine);

        // Main Title
        const mainTitle = document.createElement('div');
        mainTitle.style.textAlign = 'center';
        mainTitle.style.fontSize = '24pt';
        mainTitle.style.fontWeight = 'bold';
        mainTitle.style.marginBottom = '20px';
        mainTitle.innerText = `Report: ${reportName}`;
        element.appendChild(mainTitle);

        // Metadata Table
        const metaTable = document.createElement('div');
        metaTable.style.display = 'grid';
        metaTable.style.gridTemplateColumns = '1fr 1fr';
        metaTable.style.gap = '10px 40px';
        metaTable.style.marginBottom = '40px';
        metaTable.style.fontSize = '11pt';
        metaTable.innerHTML = `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 2px;">
            <span style="font-weight: bold;">Doc version:</span>
            <span style="color: #666;">${docVersion}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 2px;">
            <span style="font-weight: bold;">Date of version:</span>
            <span style="color: #666;">${currentDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 2px;">
            <span style="font-weight: bold;">Status of document:</span>
            <span style="color: #666;">Draft</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 2px;">
            <span style="font-weight: bold;">Author/Owner:</span>
            <span style="color: #666;">${author}</span>
          </div>
        `;
        element.appendChild(metaTable);

        // Content Sections
        const contentContainer = document.createElement('div');
        contentContainer.style.lineHeight = '1.6';
        
        // Extract content from AI messages
        const lastAiMessage = [...chatMessages].reverse().find(m => m.role === 'assistant');
        const content = lastAiMessage ? lastAiMessage.content : "No content available.";
        
        // Simple mapping to sections (1. Introduction, 2. Analysis, 3. Insights, 4. Conclusions)
        const sections = [
          { title: 'Introduction', content: '' },
          { title: 'Analysis', content: '' },
          { title: 'Strategic Insights', content: '' },
          { title: 'Conclusions', content: '' }
        ];

        // Split content into roughly 4 parts if not already structured
        const lines = content.split('\n').filter(l => l.trim());
        const linesPerSection = Math.max(1, Math.ceil(lines.length / 4));
        
        sections.forEach((sec, i) => {
          sec.content = lines.slice(i * linesPerSection, (i + 1) * linesPerSection).join('\n');
          
          const secDiv = document.createElement('div');
          secDiv.style.marginBottom = '30px';
          secDiv.innerHTML = `
            <h2 style="font-size: 18pt; font-weight: bold; margin-bottom: 10px;">${i + 1}. ${sec.title}</h2>
            <div style="font-size: 11pt; white-space: pre-wrap; color: #333;">${sec.content}</div>
          `;
          contentContainer.appendChild(secDiv);
        });
        
        element.appendChild(contentContainer);

        // Footer Line
        const footerLine = document.createElement('div');
        footerLine.style.position = 'absolute';
        footerLine.style.bottom = '40mm';
        footerLine.style.left = '20mm';
        footerLine.style.right = '20mm';
        footerLine.style.borderTop = '1px solid #000';
        element.appendChild(footerLine);

        // Footer
        const footer = document.createElement('div');
        footer.style.position = 'absolute';
        footer.style.bottom = '30mm';
        footer.style.left = '20mm';
        footer.style.right = '20mm';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.fontSize = '10pt';
        footer.style.color = '#000';
        footer.innerHTML = `
          <span>${docVersion}</span>
          <span>1</span>
          <span>[Internal]</span>
        `;
        element.appendChild(footer);

        // Temporarily append to body
        document.body.appendChild(element);
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '0';

        const safeTitle = agentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const opt = {
          margin: 0,
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

  const toggleLiveMode = async (): Promise<boolean> => {
    const currentApiKey = getApiKey();
    if (!currentApiKey) {
      toast.error('AI API Key is missing. Voice mode unavailable.');
      return false;
    }

    if (isLiveMode) {
      stopLiveMode();
      return true;
    }

    try {
      // Check if a paid API key is selected for Gemini 3 series models
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && typeof window.aistudio.openSelectKey === 'function') {
          toast.info('Vă rugăm să selectați un API Key pentru a activa modul vocal.');
          await window.aistudio.openSelectKey();
        }
      }

      const ai = new GoogleGenAI({ apiKey: currentApiKey });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const systemInstruction = `Ești dotLumen AI, o prezență feminină caldă, inteligentă și extrem de empatică. Rolul tău este de asistent de cercetare vizionară pentru .lumen (dotLumen). Vorbește natural, cald și concis în română. Răspunde în maxim 2 propoziții. CONTEXT: ${selectedAgent?.title}. ${selectedAgent?.systemPrompt || ""}`;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsLiveMode(true);
            toast.success('Sesiune vocală activă');
            sessionPromise.then(session => startMicrophone(session)).catch(err => {
              console.error('Failed to start microphone:', err);
              stopLiveMode();
            });
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text && isRecordingRef.current) {
                transcriptRef.current.push({ role: 'User', text, timestamp: new Date() });
                setMeetingTranscript([...transcriptRef.current]);
              }
            }

            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.text && isRecordingRef.current) {
                  transcriptRef.current.push({ role: 'AI', text: part.text, timestamp: new Date() });
                  setMeetingTranscript([...transcriptRef.current]);
                }
                if (part.inlineData?.data && selectedAgent?.id !== 'doc-prod') {
                  setIsAiSpeaking(true);
                  isAiSpeakingRef.current = true;
                  playReceivedAudio(part.inlineData.data, 16000);
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
            toast.error('Eroare sesiune vocală: ' + (err.message || 'Internal error'));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: "Kore" } 
            }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      const session = await sessionPromise;
      liveSessionRef.current = session;
      return true;
    } catch (error) {
      console.error('Failed to start live session:', error);
      toast.error('Microphone access or AI connection failed');
      stopLiveMode();
      return false;
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
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
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

  const goHome = () => {
    setSelectedAgent(null);
    setView('grid');
    setActiveCategory('All');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-6">
          <img 
            src={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT} 
            alt="dotLumen" 
            referrerPolicy="no-referrer"
            className="h-12 animate-pulse"
          />
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-teal-500 font-mono text-sm tracking-widest animate-pulse uppercase">Initializing Visionary System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <div className="mb-8 flex justify-center">
              <img 
                src={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT} 
                alt="dotLumen" 
                referrerPolicy="no-referrer"
                className="h-16"
              />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Visionary Research</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              The professional AI intelligence platform for dotLumen's next generation of assistive technology.
            </p>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-teal-400 dark:hover:bg-teal-500 transition-all duration-300 shadow-xl shadow-teal-500/10"
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 flex overflow-hidden font-sans transition-colors duration-300">
      <Toaster position="top-right" theme={theme} />
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 relative transition-colors duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {!sidebarCollapsed && (
            <button 
              onClick={goHome}
              className="flex items-center gap-3 group hover:opacity-80 transition-all"
            >
              <img 
                src={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT} 
                alt="dotLumen" 
                referrerPolicy="no-referrer"
                className="h-6"
              />
              <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white">VISIONARY</span>
            </button>
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
                  "flex items-center gap-3 w-full p-3 rounded-xl transition-all text-sm text-left",
                  activeCategory === cat 
                    ? "text-teal-600 dark:text-teal-400 bg-teal-500/5" 
                    : "text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-300"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", activeCategory === cat ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700")} />
                {!sidebarCollapsed && <span className="line-clamp-2">{cat}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30", sidebarCollapsed && "justify-center")}>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-slate-700"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
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
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl z-20 transition-colors duration-300">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search intelligence agents, use cases, or research topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-white transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setView('archive')}
              className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-white transition-colors relative"
              title="Research Archive"
            >
              <History className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-white dark:border-[#050505]" />
            </button>
            <button 
              onClick={() => {
                setIsNewResearchModalOpen(true);
              }}
              className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
              title="Start New Research"
            >
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
                    <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Playbook</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Select a specialized AI agent to begin your research or business task.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAgents.map(agent => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      theme={theme}
                      onLogoClick={goHome}
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
                    <Archive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Research Archive</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Historical intelligence reports and AI-generated strategic documents.</p>
                </div>
                
                <ArchiveGrid reports={reports} theme={theme} onLogoClick={goHome} onSelect={handleOpenReport} />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-slate-100/90 dark:bg-[#050505]/90 backdrop-blur-sm transition-colors duration-300"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-6xl h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black transition-colors duration-300"
            >
              {/* Modal Header */}
              <div className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-xl">
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{selectedAgent.title}</h3>
                      <img 
                        src={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT} 
                        alt="dotLumen" 
                        referrerPolicy="no-referrer"
                        onClick={goHome}
                        className="h-4 opacity-60 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-500 uppercase tracking-widest">{selectedAgent.number}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[10px] text-slate-500 dark:text-slate-500">{selectedAgent.category}</span>
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
                  {selectedAgent?.id !== 'doc-prod' && (
                    <button 
                      onClick={toggleLiveMode}
                      className={cn(
                        "p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold",
                        isLiveMode 
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-white"
                      )}
                    >
                      {isLiveMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      {isLiveMode ? "LIVE SESSION" : "VOICE MODE"}
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedAgent(null)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-white rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50/40 dark:bg-[#050505]/40 relative transition-colors duration-300">
                  <div 
                    id="chat-messages-container"
                    className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide"
                  >
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/20">
                          <Bot className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Initialize Research</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                          I'm ready to assist with {selectedAgent.title.toLowerCase()}. You can upload documents or start by describing your task.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                          {selectedAgent.id === 'doc-prod' ? (
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="col-span-2 p-6 bg-teal-500/10 dark:bg-teal-500/5 border-2 border-dashed border-teal-500/30 rounded-2xl text-sm font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all flex flex-col items-center gap-3"
                            >
                              <div className="p-3 bg-teal-500/20 rounded-xl">
                                <Plus className="w-6 h-6" />
                              </div>
                              Adaugă documente
                              <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">PDF, DOCX, EXCEL, IMAGINI, VIDEO</span>
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setInputText("Analyze the current market trends for dotLumen and assistive technology.");
                                  setTimeout(handleSendMessage, 0);
                                }}
                                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-teal-500/40 transition-all"
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
                            </>
                          )}
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
                            "p-4 rounded-2xl text-sm leading-relaxed transition-colors duration-300",
                            msg.role === 'user' 
                              ? "bg-teal-500 text-black font-medium" 
                              : "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 shadow-sm dark:shadow-none"
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
                  <div className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {uploadedFiles.map(file => (
                          <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-600 dark:text-teal-400 font-medium group">
                            <FileText className="w-3 h-3" />
                            {file.name}
                            <button 
                              onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                              className="hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-4 pr-24 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all resize-none scrollbar-hide"
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
                            accept=".pdf,.docx,.doc,.xlsx,.xls,image/*,video/*"
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
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Knowledge Base</h4>
                    <KnowledgeBase 
                      items={knowledgeBase}
                      onAddLink={handleAddKnowledgeLink}
                      onUploadFile={() => kbFileInputRef.current?.click()}
                      onRemoveItem={handleRemoveKnowledgeItem}
                    />
                    <input 
                      type="file" 
                      ref={kbFileInputRef} 
                      className="hidden" 
                      multiple 
                      onChange={(e) => handleKnowledgeFileUpload(e.target.files)}
                    />
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      {selectedAgent.id === 'doc-prod' ? (
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

      {/* New Research Modal */}
      <AnimatePresence>
        {isNewResearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 bg-slate-100/90 dark:bg-[#050505]/90 backdrop-blur-sm transition-colors duration-300"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black transition-colors duration-300"
            >
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Research</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select keywords or add your own to start a new strategic report.</p>
                </div>
                <button 
                  onClick={() => setIsNewResearchModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh] space-y-8">
                {/* Initial Keywords */}
                <div>
                  <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4">Initial Version Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {INITIAL_KEYWORDS.map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => {
                          if (!customKeywords.includes(keyword)) {
                            setCustomKeywords([...customKeywords, keyword]);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg text-sm text-slate-600 dark:text-slate-400 transition-all border border-transparent hover:border-teal-500/20"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Keywords */}
                <div>
                  <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4">Your Research Focus</h4>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newKeywordInput.trim()) {
                          setCustomKeywords([...customKeywords, newKeywordInput.trim()]);
                          setNewKeywordInput('');
                        }
                      }}
                      placeholder="Add a keyword or phrase..."
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:text-white transition-all"
                    />
                    <button 
                      onClick={() => {
                        if (newKeywordInput.trim()) {
                          setCustomKeywords([...customKeywords, newKeywordInput.trim()]);
                          setNewKeywordInput('');
                        }
                      }}
                      className="p-3 bg-teal-500 text-black rounded-xl hover:bg-teal-400 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {customKeywords.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No keywords added yet. Click initial keywords or add your own above.</p>
                    ) : (
                      customKeywords.map((keyword, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium flex items-center gap-2 border border-teal-500/20"
                        >
                          {keyword}
                          <button 
                            onClick={() => setCustomKeywords(customKeywords.filter((_, i) => i !== idx))}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                <button 
                  onClick={() => {
                    setCustomKeywords([]);
                    setIsNewResearchModalOpen(false);
                  }}
                  className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={customKeywords.length === 0}
                  onClick={() => {
                    handleStartResearch(customKeywords);
                  }}
                  className="px-8 py-3 bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Initialize Strategic Research
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
