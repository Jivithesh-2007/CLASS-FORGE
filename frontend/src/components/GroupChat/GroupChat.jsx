import React, { useState, useEffect, useRef } from 'react';
import { MdSend, MdClose } from 'react-icons/md';
import { messageAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import styles from './GroupChat.module.css';

const GroupChat = ({ group, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_message');
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
      
      socket.on('new_message', (message) => {
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
      await messageAPI.sendMessage({
        groupId: group._id,
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div>
          <h3 className={styles.groupName}>{group.name}</h3>
          <p className={styles.memberCount}>{group.members?.length || 0} members</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <MdClose size={24} />
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loadingText}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyText}>No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`${styles.message} ${
                msg.sender._id === currentUser.id ? styles.sentMessage : styles.receivedMessage
              }`}
            >
              <div className={styles.messageContent}>
                {msg.sender._id !== currentUser.id && (
                  <p className={styles.senderName}>{msg.sender.fullName}</p>
                )}
                <p className={styles.messageText}>{msg.content}</p>
                <p className={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}>
          <MdSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
