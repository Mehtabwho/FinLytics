import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      {/* Header */}
      <div className="bg-primary p-4 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Bot size={24} className="text-secondary" />
            </div>
            <div>
                <h1 className="font-bold text-lg">FinLytics Assistant</h1>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                    Online & Ready to help
                </p>
            </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary text-secondary'
                }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                }`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
             <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-secondary flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                    <Sparkles size={16} className="text-secondary animate-pulse" />
                    Thinking...
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={sendMessage} className="relative flex items-center gap-2">
            <input
            type="text"
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 placeholder:text-slate-400"
            placeholder="Ask about your taxes, expenses, or profit..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            />
            <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
            >
                <Send size={18} />
            </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <AlertCircle size={10} /> AI can make mistakes. Verify important financial info.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
