// import React, { useState, useEffect } from "react";
// import { BsEmojiSmileFill } from "react-icons/bs";
// import { IoMdSend } from "react-icons/io";
// import Picker from "emoji-picker-react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import './Chat.css';
// import { useParams } from "react-router-dom";

// let socket;

// const ChatSection = () => {
//     const { userIdc } = useParams();
//     const [currentSelected, setCurrentSelected] = useState(null);
//     const [msg, setMsg] = useState("");
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//     const [messages, setMessages] = useState({});
//     const [contacts, setContacts] = useState([]);
//     const [file, setFile] = useState(null);
//     const [filePreview, setFilePreview] = useState(null);

//     const userId = localStorage.getItem("id");
//     const token = localStorage.getItem("token");

//     useEffect(() => {
//         if (!userId) return;

//         axios.get(`http://localhost:5002/api/users/all/${userId}`)
//             .then((response) => setContacts(response.data.users))
//             .catch((error) => console.error("Error fetching users:", error));

//         socket = io("http://localhost:5002");
//         socket.emit("userJoined", userId);

//         socket.on("receiveMessage", (message) => {
//             if (message.sender !== userId) {
//                 const otherUser = message.users.find((u) => u !== userId);
//                 setMessages((prevMessages) => ({
//                     ...prevMessages,
//                     [otherUser]: [
//                         ...(prevMessages[otherUser] || []),
//                         { text: message.message.text, sender: message.sender, file: message.message.file },
//                     ],
//                 }));
//             }
//         });

//         return () => {
//             socket.disconnect();
//         };
//     }, [userId]);

//     // ✅ Fix: Wait for contacts to load before setting selected chat
//     useEffect(() => {
//         if (contacts.length > 0 && userIdc) {
//             const index = contacts.findIndex(c => String(c._id) === String(userIdc));
//             if (index !== -1) {
//                 setCurrentSelected(index);
//             } else {
//                 console.warn("Contact not found for userIdc:", userIdc);
//             }
//         }
//     }, [contacts, userIdc]);

//     // Auto scroll on new messages
//     useEffect(() => {
//         const chatBox = document.querySelector(".messages");
//         if (chatBox) {
//             chatBox.scrollTop = chatBox.scrollHeight;
//         }
//     }, [messages, currentSelected]);

//     useEffect(() => {
//         const fetchMessages = async (contactIndex) => {
//             try {
//                 const from = userId;
//                 const to = contacts[contactIndex]?._id;
//                 if (!to) return;

//                 const response = await axios.post(
//                     "http://localhost:5002/api/chat/getmsg",
//                     { from, to },
//                     { headers: { Authorization: token } }
//                 );

//                 const msgs = response.data.messages.map((msg) => ({
//                     text: msg.message.text,
//                     sender: msg.sender === userId ? "You" : msg.sender,
//                     file: msg.message.file,
//                 }));

//                 setMessages((prev) => ({
//                     ...prev,
//                     [to]: msgs,
//                 }));
//             } catch (err) {
//                 console.error("Error fetching messages:", err);
//             }
//         };

//         if (currentSelected !== null && contacts.length > 0) {
//             fetchMessages(currentSelected);
//         }
//     }, [currentSelected, contacts, userId]);

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         setFile(selectedFile);

//         const isImage = selectedFile?.type?.startsWith("image/");
//         const isPdf = selectedFile?.type === "application/pdf";

//         if (isImage || isPdf) {
//             const url = URL.createObjectURL(selectedFile);
//             setFilePreview({ type: selectedFile.type, url, name: selectedFile.name });
//         } else {
//             setFilePreview({ type: selectedFile.type, name: selectedFile.name });
//         }
//     };

//     const handleEmojiClick = (emojiObject) => {
//         setMsg((prev) => prev + emojiObject.emoji);
//     };

//     const sendChat = async (event) => {
//         event.preventDefault();
//         if ((msg.trim() || file) && currentSelected !== null) {
//             const recipientId = contacts[currentSelected]._id;
//             let fileData = null;

//             if (file) {
//                 const formData = new FormData();
//                 formData.append("file", file);
//                 const uploadRes = await axios.post("http://localhost:5002/api/chat/upload", formData);
//                 fileData = uploadRes.data;
//             }

//             await axios.post("http://localhost:5002/api/chat/addmsg", {
//                 from: userId,
//                 to: recipientId,
//                 message: msg,
//                 file: fileData,
//             }, {
//                 headers: { Authorization: token }
//             });

//             setMessages((prevMessages) => ({
//                 ...prevMessages,
//                 [recipientId]: [
//                     ...(prevMessages[recipientId] || []),
//                     { text: msg, sender: "You", file: fileData },
//                 ],
//             }));

//             setMsg("");
//             setFile(null);
//             setFilePreview(null);
//             setShowEmojiPicker(false);
//         }
//     };

//     const renderFile = (file) => {
//         const isImage = file.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
//         const isPdf = file.url?.match(/\.pdf$/i);

//         return (
//             <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-box">
//                 {isImage ? (
//                     <img src={file.url} alt={file.fileName} className="file-image" />
//                 ) : isPdf ? (
//                     <iframe src={file.url} title={file.fileName} className="file-preview-pdf" />
//                 ) : (
//                     <div className="file-icon">📄</div>
//                 )}
//                 {!isImage && (
//                     <div className="file-info">
//                         <span>{file.fileName}</span>
//                         <div className="file-buttons">
//                             <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-btn">Open</a>
//                             <a href={file.url} download className="file-btn">Download</a>
//                         </div>
//                     </div>
//                 )}
//             </a>
//         );
//     };

//     return (
//         <div className="chat-wrapper">
//             <div className="contacts-section">
//                 <h3>Contacts</h3>
//                 {contacts.length > 0 ? (
//                     contacts.map((contact, index) => (
//                         <div
//                             key={contact._id}
//                             onClick={() => setCurrentSelected(index)}
//                             className={`contact-item ${currentSelected === index ? "selected" : ""}`}
//                         >
//                             {contact.username}
//                         </div>
//                     ))
//                 ) : (
//                     <p>No contacts available</p>
//                 )}
//             </div>

//             <div className="chat-container">
//                 {currentSelected !== null ? (
//                     <>
//                         <div className="chat-header">
//                             <h2>Chatting with {contacts[currentSelected]?.username}</h2>
//                         </div>

//                         <div className="messages">
//                             {messages[contacts[currentSelected]._id]?.length > 0 ? (
//                                 messages[contacts[currentSelected]._id].map((msg, index) => (
//                                     <div
//                                         key={index}
//                                         className={`message ${msg.sender === "You" ? "sent" : "received"}`}
//                                     >
//                                         <p>{msg.text}</p>
//                                         {msg.file && msg.file.url && renderFile(msg.file)}
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p className="no-messages">No messages yet. Say Hi!</p>
//                             )}
//                         </div>

//                         {filePreview && (
//                             <div className="preview-container">
//                                 {filePreview.type.startsWith("image/") ? (
//                                     <img src={filePreview.url} alt="Preview" />
//                                 ) : filePreview.type === "application/pdf" ? (
//                                     <iframe src={filePreview.url} title="PDF Preview" className="preview-pdf" />
//                                 ) : (
//                                     <div className="preview-file-info">
//                                         <span className="file-icon">📄</span>
//                                         <span>{filePreview.name}</span>
//                                     </div>
//                                 )}
//                                 <span className="preview-remove" onClick={() => { setFile(null); setFilePreview(null); }}>×</span>
//                             </div>
//                         )}

//                         {showEmojiPicker && (
//                             <div className="emoji-wrapper">
//                                 <span className="emoji-close" onClick={() => setShowEmojiPicker(false)}>×</span>
//                                 <Picker onEmojiClick={handleEmojiClick} />
//                             </div>
//                         )}

//                         <form className="input-container" onSubmit={sendChat}>
//                             <div className="emoji-toggle">
//                                 <BsEmojiSmileFill onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
//                             </div>
//                             <input
//                                 type="file"
//                                 onChange={handleFileChange}
//                                 style={{ display: "none" }}
//                                 id="file-upload"
//                             />
//                             <label htmlFor="file-upload" className="file-upload-icon">📁</label>

//                             <input
//                                 type="text"
//                                 placeholder="Type your message here..."
//                                 onChange={(e) => setMsg(e.target.value)}
//                                 value={msg}
//                             />
//                             <button type="submit">
//                                 <IoMdSend />
//                             </button>
//                         </form>
//                     </>
//                 ) : (
//                     <p className="start-txt">Select a contact to start chatting</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ChatSection;
























import React, { useState, useEffect } from 'react';
import { BsEmojiSmileFill } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import Picker from 'emoji-picker-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Chat.css';
import { useParams } from 'react-router-dom';

let socket;

const ChatSection = ({ searchQuery }) => {
    const { userIdc } = useParams();
    const [currentSelected, setCurrentSelected] = useState(null);
    const [msg, setMsg] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messages, setMessages] = useState({});
    const [contacts, setContacts] = useState([]);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    const userId = localStorage.getItem("id");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!userId) return;

        // Fetch contacts
        axios.get(`http://localhost:5002/api/users/all/${userId}`)
            .then((response) => setContacts(response.data.users))
            .catch((error) => console.error("Error fetching users:", error));

        socket = io("http://localhost:5002");
        socket.emit("userJoined", userId);

        socket.on("receiveMessage", (message) => {
            if (message.sender !== userId) {
                const otherUser = message.users.find((u) => u !== userId);
                setMessages((prevMessages) => ({
                    ...prevMessages,
                    [otherUser]: [
                        ...(prevMessages[otherUser] || []),
                        { text: message.message.text, sender: message.sender, file: message.message.file },
                    ],
                }));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    // Wait for contacts to load and select the user based on `userIdc`
    useEffect(() => {
        if (contacts.length > 0 && userIdc) {
            const index = contacts.findIndex(c => String(c._id) === String(userIdc));
            if (index !== -1) {
                setCurrentSelected(index);
            } else {
                console.warn("Contact not found for userIdc:", userIdc);
            }
        } else if (contacts.length === 0) {
            console.warn("Contacts not loaded yet");
        }
    }, [contacts, userIdc]);

    // Fetch messages when a contact is selected
    useEffect(() => {
        const fetchMessages = async (contactIndex) => {
            try {
                const from = userId;
                const to = contacts[contactIndex]?._id;
                if (!to) return;

                const response = await axios.post(
                    "http://localhost:5002/api/chat/getmsg",
                    { from, to },
                    { headers: { Authorization: token } }
                );

                const msgs = response.data.messages.map((msg) => ({
                    text: msg.message.text,
                    sender: msg.sender === userId ? "You" : msg.sender,
                    file: msg.message.file,
                }));

                setMessages((prev) => ({
                    ...prev,
                    [to]: msgs,
                }));
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        if (currentSelected !== null && contacts.length > 0) {
            fetchMessages(currentSelected);
        }
    }, [currentSelected, contacts, userId]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        const isImage = selectedFile?.type?.startsWith("image/");
        const isPdf = selectedFile?.type === "application/pdf";

        if (isImage || isPdf) {
            const url = URL.createObjectURL(selectedFile);
            setFilePreview({ type: selectedFile.type, url, name: selectedFile.name });
        } else {
            setFilePreview({ type: selectedFile.type, name: selectedFile.name });
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMsg((prev) => prev + emojiObject.emoji);
    };

    const sendChat = async (event) => {
        event.preventDefault();
        if ((msg.trim() || file) && currentSelected !== null) {
            const recipientId = contacts[currentSelected]._id;
            let fileData = null;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const uploadRes = await axios.post("http://localhost:5002/api/chat/upload", formData);
                fileData = uploadRes.data;
            }

            await axios.post("http://localhost:5002/api/chat/addmsg", {
                from: userId,
                to: recipientId,
                message: msg,
                file: fileData,
            }, {
                headers: { Authorization: token }
            });

            setMessages((prevMessages) => ({
                ...prevMessages,
                [recipientId]: [
                    ...(prevMessages[recipientId] || []),
                    { text: msg, sender: "You", file: fileData },
                ],
            }));

            setMsg("");
            setFile(null);
            setFilePreview(null);
            setShowEmojiPicker(false);
        }
    };

    
    const renderFile = (file) => {
        const isImage = file.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
        const isPdf = file.url?.match(/\.pdf$/i);

        return (
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-box">
                {isImage ? (
                    <img src={file.url} alt={file.fileName} className="file-image" />
                ) : isPdf ? (
                    <iframe src={file.url} title={file.fileName} className="file-preview-pdf" />
                ) : (
                    <div className="file-icon">📄</div>
                )}
                {!isImage && (
                    <div className="file-info">
                        <span>{file.fileName}</span>
                        <div className="file-buttons">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-btn">Open</a>
                            <a href={file.url} download className="file-btn">Download</a>
                        </div>
                    </div>
                )}
            </a>
        );
    };

    // Filter contacts based on searchQuery
    // const filteredContacts = contacts.filter(contact => 
    //     contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    const filteredContacts = contacts
    .filter(contact => !contact.email.includes('@discover'))
    .filter(contact => contact.username.toLowerCase().includes(searchQuery.toLowerCase()));
    // const filteredContacts = contacts.filter(contact => 
    //     !contact.email.includes('@discover') &&
    //     contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    // );
    
    return (
        <div className="chat-wrapper">
            <div className="contacts-section">
                <h3>Contacts</h3>
                {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact, index) => (
                        <div
                            key={contact._id}
                            onClick={() => setCurrentSelected(index)}
                            className={`contact-item ${currentSelected === index ? "selected" : ""}`}
                        >
                            {contact.username}
                        </div>
                    ))
                ) : (
                    <p>No contacts available</p>
                )}
            </div>

            <div className="chat-container">
                {currentSelected !== null ? (
                    <>
                        <div className="chat-header">
                            <h2>Chatting with {filteredContacts[currentSelected]?.username}</h2>
                        </div>

                        <div className="messages">
                            {messages[filteredContacts[currentSelected]._id]?.length > 0 ? (
                                messages[filteredContacts[currentSelected]._id].map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.sender === "You" ? "sent" : "received"}`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.file && msg.file.url && renderFile(msg.file)}
                                    </div>
                                ))
                            ) : (
                                <p className="no-messages">No messages yet. Say Hi!</p>
                            )}
                        </div>

                        {filePreview && (
                            <div className="preview-container">
                                {filePreview.type.startsWith("image/") ? (
                                    <img src={filePreview.url} alt="Preview" />
                                ) : filePreview.type === "application/pdf" ? (
                                    <iframe src={filePreview.url} title="PDF Preview" className="preview-pdf" />
                                ) : (
                                    <div className="preview-file-info">
                                        <span className="file-icon">📄</span>
                                        <span>{filePreview.name}</span>
                                    </div>
                                )}
                                <span className="preview-remove" onClick={() => { setFile(null); setFilePreview(null); }}>×</span>
                            </div>
                        )}

                        {showEmojiPicker && (
                            <div className="emoji-wrapper">
                                <span className="emoji-close" onClick={() => setShowEmojiPicker(false)}>×</span>
                                <Picker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}

                        <form className="input-container" onSubmit={sendChat}>
                            <div className="emoji-toggle">
                                <BsEmojiSmileFill onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                            </div>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="file-upload-icon">📁</label>

                            <input
                                type="text"
                                placeholder="Type your message here..."
                                onChange={(e) => setMsg(e.target.value)}
                                value={msg}
                            />
                            <button type="submit">
                                <IoMdSend />
                            </button>
                        </form>
                    </>
                ) : (
                    <p className="start-txt">Select a contact to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default ChatSection;
