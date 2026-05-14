import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/Animations';
import Button from '../components/Button';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your FinLytics AI assistant. Ask me anything about your finances, tax rules, or how to save money.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { year } = useFinancialYear();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMessage.content, financialYear: year });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-140px)] glass-card rounded-2xl shadow-sm border border-slate-700 overflow-hidden relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 to-primary p-4 text-white flex items-center justify-between shadow-md z-10"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
            >
              <Bot size={24} className="text-emerald-400" />
            </motion.div>
            <div>
              <h1 className="font-bold text-lg">FinLytics Assistant</h1>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online & Ready to help
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/30 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-cyan-500 text-white'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </motion.div>

                  {/* Bubble */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed transition-all ${
                        msg.role === 'user' 
                            ? 'bg-emerald-500 text-white rounded-br-none' 
                            : 'bg-slate-800/70 border border-slate-700 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-slate-400 text-sm">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                    <Sparkles size={16} className="text-emerald-400" />
                  </motion.div>
                  Thinking...
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-800/50 border-t border-slate-700"
        >
          <form onSubmit={sendMessage} className="relative flex items-center gap-2">
            <motion.input
              type="text"
              whileFocus={{ scale: 1.01 }}
              className="w-full pl-4 pr-12 py-3.5 bg-slate-800/70 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
              placeholder="Ask about your taxes, expenses, or profit..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <motion.button 
              type="submit" 
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 p-2 gradient-btn text-white rounded-lg disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
            >
              <Send size={18} />
            </motion.button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <AlertCircle size={10} /> AI can make mistakes. Verify important financial info.
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Chat;