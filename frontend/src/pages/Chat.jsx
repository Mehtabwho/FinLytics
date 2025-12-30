import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
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
      const { data } = await api.post('/ai/chat', { message: userMessage.content });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-primary-light p-4 text-white flex items-center justify-between shadow-md z-10"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm"
            >
              <Bot size={24} className="text-secondary" />
            </motion.div>
            <div>
              <h1 className="font-bold text-lg">FinLytics Assistant</h1>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Online & Ready to help
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
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
                        msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary text-secondary'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </motion.div>

                  {/* Bubble */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed transition-all ${
                        msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
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
                <div className="w-8 h-8 rounded-full bg-primary text-secondary flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                    <Sparkles size={16} className="text-secondary" />
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
          className="p-4 bg-white border-t border-slate-100"
        >
          <form onSubmit={sendMessage} className="relative flex items-center gap-2">
            <motion.input
              type="text"
              whileFocus={{ scale: 1.02 }}
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 placeholder:text-slate-400"
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
              className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
            >
              <Send size={18} />
            </motion.button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <AlertCircle size={10} /> AI can make mistakes. Verify important financial info.
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Chat;
