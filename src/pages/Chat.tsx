import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chatService, type ChatMessage } from '../services/chatService';
import { agentService, type Agent } from '../services/agentService';
import { useAuth } from '../contexts/AuthContext';
import './Chat.css';

interface FileWithPreview extends File {
  preview?: string;
}

export const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadataInput, setMetadataInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metadataInputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    // Cleanup preview URLs
    return () => {
      selectedFiles.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

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

  const getFileType = (file: File): 'audio' | 'image' | 'video' | 'document' | 'code' | 'other' => {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('word') || file.type.includes('text')) return 'document';
    if (file.type.includes('javascript') || file.type.includes('json') || file.type.includes('xml') || 
        file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|cs|php|rb|go|rs|sql|sh|yaml|yml|json|xml|html|css)$/i)) return 'code';
    return 'other';
  };

  const getFileIcon = (file: File): string => {
    const type = getFileType(file);
    const icons: Record<typeof type, string> = {
      audio: '🎵',
      image: '🖼️',
      video: '🎬',
      document: '📄',
      code: '💻',
      other: '📎',
    };
    return icons[type];
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || sending) return;

    const userMessage = input.trim();
    const filesToSend = [...selectedFiles];
    let metadata: Record<string, any> | undefined;
    
    // Parse metadata if provided
    if (metadataInput.trim()) {
      try {
        metadata = JSON.parse(metadataInput.trim());
      } catch (err) {
        setError('Invalid JSON in metadata. Please check your syntax.');
        return;
      }
    }

    setInput('');
    setSelectedFiles([]);
    setMetadataInput('');
    setShowMetadata(false);
    setError(null);
    setSending(true);

    const userContent = userMessage || (filesToSend.length > 0 ? `[${filesToSend.length} file(s)]` : '');

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
        metadata,
      });

      setConversationId(response.conversationId);
      await loadHistory();
    } catch (err: any) {
      if (err.response?.status === 402) {
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
      
      setMessages((prev) => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    if (files.length + selectedFiles.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    const filesWithPreview: FileWithPreview[] = files.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    
    setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeFile = (index: number) => {
    const file = selectedFiles[index];
    if (file.preview && file.preview.startsWith('blob:')) {
      URL.revokeObjectURL(file.preview);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const renderFilePreview = (file: FileWithPreview, index: number) => {
    const type = getFileType(file);
    const icon = getFileIcon(file);

    return (
      <div key={index} className="file-item">
        <span className="file-icon">{icon}</span>
        <span className="file-name" title={file.name}>{file.name}</span>
        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
        
        {type === 'audio' && file.preview && (
          <audio
            controls
            src={file.preview}
            style={{ maxWidth: '200px', height: '30px', marginLeft: '8px' }}
          />
        )}
        
        {type === 'image' && file.preview && (
          <img
            src={file.preview}
            alt={file.name}
            className="file-preview-image"
            style={{ maxWidth: '100px', maxHeight: '100px', marginLeft: '8px', borderRadius: '4px' }}
          />
        )}
        
        {type === 'video' && file.preview && (
          <video
            controls
            src={file.preview}
            style={{ maxWidth: '200px', maxHeight: '150px', marginLeft: '8px' }}
          />
        )}
        
        <button onClick={() => removeFile(index)} className="file-remove" title="Remove file">×</button>
      </div>
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    const content = message.content;
    const files = message.metadata?.files || [];

    return (
      <>
        <div className="message-content">{content}</div>
        {files.length > 0 && (
          <div className="message-files">
            {files.map((file: any, idx: number) => {
              const fileUrl = file.url || (file.ipfsHash ? `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}` : null);
              return (
                <div key={idx} className="message-file-item">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    📎 {file.originalname || file.name || 'File'}
                  </a>
                  {file.mimetype?.startsWith('audio/') && fileUrl && (
                    <audio controls src={fileUrl} style={{ marginTop: '8px', width: '100%', maxWidth: '300px' }} />
                  )}
                  {file.mimetype?.startsWith('image/') && fileUrl && (
                    <img src={fileUrl} alt={file.originalname} style={{ marginTop: '8px', maxWidth: '300px', borderRadius: '4px' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {message.metadata && Object.keys(message.metadata).filter(k => k !== 'files').length > 0 && (
          <details className="message-metadata">
            <summary>Metadata</summary>
            <pre>{JSON.stringify(message.metadata, null, 2)}</pre>
          </details>
        )}
      </>
    );
  };

  if (!agent) {
    return <div className="loading">Loading agent...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Link to={`/agents/${id}`} className="back-link">← Back</Link>
        <h2>{agent.name}</h2>
        {agent.description && <span className="agent-description-header">{agent.description}</span>}
      </div>

      <div 
        className={`chat-messages ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && <div className="drag-overlay">Drop files here</div>}
        
        {loading && messages.length === 0 ? (
          <div className="loading">Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <p>Start a conversation with {agent.name}</p>
            <p className="empty-hint">
              {agent.capabilities && agent.capabilities.length > 0 && (
                <>Supports: {agent.capabilities.join(', ')}</>
              )}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              {renderMessageContent(message)}
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
          {selectedFiles.map((file, index) => renderFilePreview(file, index))}
        </div>
      )}

      {showMetadata && (
        <div className="metadata-input-container">
          <div className="metadata-header">
            <label>Metadata (JSON, optional)</label>
            <button onClick={() => setShowMetadata(false)} className="close-button">×</button>
          </div>
          <textarea
            ref={metadataInputRef}
            value={metadataInput}
            onChange={(e) => setMetadataInput(e.target.value)}
            placeholder='{"key": "value", "context": "example"}'
            className="metadata-input"
            rows={4}
          />
          <small className="metadata-hint">Add custom metadata to send with your message (must be valid JSON)</small>
        </div>
      )}

      <form onSubmit={handleSend} className="chat-input-form">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="file-button"
          title="Attach files (audio, images, documents, code, etc.)"
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
        <button
          type="button"
          onClick={() => {
            setShowMetadata(!showMetadata);
            setTimeout(() => metadataInputRef.current?.focus(), 100);
          }}
          className={`metadata-button ${showMetadata ? 'active' : ''}`}
          title="Add metadata (JSON)"
        >
          ⚙️
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedFiles.length > 0 ? "Add a message (optional)..." : "Type your message or upload files..."}
          disabled={sending}
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !showMetadata) {
              e.preventDefault();
              handleSend(e);
            }
          }}
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
