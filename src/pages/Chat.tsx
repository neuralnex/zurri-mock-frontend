import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chatService, type ChatMessage } from '../services/chatService';
import { agentService, type Agent } from '../services/agentService';
import { useAuth } from '../contexts/AuthContext';
import './Chat.css';

export const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (id) {
      loadAgent();
      loadHistory();
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAgent = async () => {
    try {
      const data = await agentService.getById(id!);
      setAgent(data);
    } catch (err) {
      console.error('Failed to load agent:', err);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await chatService.getHistory(id!, { limit: 50 });
      setMessages(history);
      // Extract conversationId from last message if available
      if (history.length > 0) {
        const lastMessage = history[history.length - 1];
        if (lastMessage.conversationId) {
          setConversationId(lastMessage.conversationId);
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || sending) return;

    const userMessage = input.trim();
    const filesToSend = [...selectedFiles];
    setInput('');
    setSelectedFiles([]);
    setError(null);
    setSending(true);

    // Build user message content for display
    const userContent = userMessage || (filesToSend.length > 0 ? `[${filesToSend.length} file(s)]` : '');

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userContent,
      agentId: id!,
      userId: 'current',
      conversationId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatService.sendMessage(id!, {
        message: userMessage || undefined,
        conversationId,
        files: filesToSend.length > 0 ? filesToSend : undefined,
      });

      setConversationId(response.conversationId);

      // Reload history to get actual messages from backend
      await loadHistory();
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 402) {
        // Insufficient wallet balance
        const details = err.response.data.details;
        setError(
          details?.message || 
          `Insufficient balance. You need ${details?.required || 0} points ($${((details?.required || 0) * 0.05).toFixed(2)}).`
        );
      } else if (err.response?.status === 404) {
        setError('Agent not found');
      } else if (err.response?.status === 401) {
        setError('Authentication required');
        navigate('/login');
      } else {
        const errorMsg = err.response?.data?.error || 'Failed to send message';
        setError(errorMsg);
        
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          agentId: id!,
          userId: 'current',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
      
      // Remove the temp user message on error
      setMessages((prev) => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }
    
    // Check file sizes (10MB max each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!agent) {
    return <div className="loading">Loading agent...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Link to={`/agents/${id}`} className="back-link">← Back</Link>
        <h2>{agent.name}</h2>
      </div>

      <div className="chat-messages">
        {loading && messages.length === 0 ? (
          <div className="loading">Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">Start a conversation with {agent.name}</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
              {message.metadata?.files && message.metadata.files.length > 0 && (
                <div className="message-files">
                  {message.metadata.files.map((file: any, idx: number) => (
                    <a
                      key={idx}
                      href={file.url || file.ipfsHash}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      📎 {file.originalname || file.name}
                    </a>
                  ))}
                </div>
              )}
              <div className="message-time">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
              <button onClick={() => removeFile(index)} className="file-remove">×</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="chat-input-form">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="file-button"
          title="Attach files"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept="*/*"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={sending || (!input.trim() && selectedFiles.length === 0)} 
          className="send-button"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

