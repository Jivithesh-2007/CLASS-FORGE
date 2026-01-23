import { useState, useEffect, useRef } from 'react';
import { MdSend, MdClose, MdMoreVert } from 'react-icons/md';
import { messageAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useToast } from '../../context/ToastContext';
import styles from './GroupChat.module.css';

const GroupChat = ({ group, onClose, currentUser, onShowDetails }) => {
  const { success, error: showError } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_message');
        socketRef.current.off('user_typing');
      }
    };
  }, [group._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getGroupMessages(group._id, { limit: 50 });
      setMessages(response.data.messages || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      socket.emit('join_group', group._id);
      
      // Remove any existing listeners to prevent duplicates
      socket.off('new_message');
      
      socket.on('new_message', (message) => {
        console.log('📨 New message received:', message);
        setMessages(prev => [...prev, message]);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        groupId: group._id,
        content: newMessage
      };

      console.log('📤 Sending message:', messageData);
      const response = await messageAPI.sendMessage(messageData);

      // Don't add message here - let socket listener handle it
      if (response.data && response.data.data) {
        console.log('✓ Message sent successfully');
        success('Message sent!');
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit('typing', { groupId: group._id, userId: currentUser.id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach(msg => {
      const date = formatDate(msg.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  return (
    <div className={styles.chatContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.groupIcon}>
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className={styles.groupName}>{group.name}</h3>
            <p className={styles.memberCount}>{group.members?.length || 0} members</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.iconBtn} 
            onClick={onShowDetails}
            title="Group details"
          >
            <MdMoreVert size={20} />
          </button>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <MdClose size={24} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyText}>No messages yet</div>
            <div className={styles.emptySubtext}>Start the conversation!</div>
          </div>
        ) : (
          <>
            {Object.entries(groupMessagesByDate()).map(([date, msgs]) => (
              <div key={date}>
                <div className={styles.dateSeperator}>
                  <span>{date}</span>
                </div>
                {msgs.map((msg) => (
                  <div
                    key={msg._id}
                    className={`${styles.messageWrapper} ${
                      msg.sender._id === currentUser.id ? styles.sentWrapper : styles.receivedWrapper
                    }`}
                  >
                    {msg.sender._id !== currentUser.id && (
                      <div className={styles.senderAvatar}>
                        {msg.sender.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={styles.messageContent}>
                      {msg.sender._id !== currentUser.id && (
                        <p className={styles.senderName}>{msg.sender.fullName}</p>
                      )}
                      <div className={`${styles.messageBubble} ${
                        msg.sender._id === currentUser.id ? styles.sentBubble : styles.receivedBubble
                      }`}>
                        {msg.content && (
                          <p className={styles.messageText}>{msg.content}</p>
                        )}
                        <p className={styles.messageTime}>{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className={styles.messageInput}
        />

        <button 
          type="submit" 
          className={styles.sendBtn} 
          disabled={!newMessage.trim()}
          title="Send message"
        >
          <MdSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
