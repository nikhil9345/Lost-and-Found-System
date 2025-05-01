import React, { useState } from "react";
import "./ChatBox.css";

const ChatBox = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleSend = () => {
    if (input.trim() !== "" || selectedFile) {
      const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
      const newMessage = {
        text: input,
        sender: "You",
        file: fileUrl,
        fileName: selectedFile ? selectedFile.name : null
      };

      setMessages([...messages, newMessage]);
      setInput("");
      setSelectedFile(null);
      setFilePreview(null);  // Reset file preview
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-headers">
        <span>Chat with {user}</span>
        <button onClick={onClose}>&times;</button>
      </div>

      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === "You" ? "user" : "bot"}`}>
            <strong>{msg.sender}:</strong> {msg.text}
            {msg.file && (
              <div className="file-preview">
                {msg.fileName.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <img src={msg.file} alt="Uploaded" />
                ) : (
                  <a href={msg.file} download={msg.fileName}>{msg.fileName}</a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* File Preview Moved to Middle */}
      {selectedFile && (
        <div className="file-preview-container">
          <strong>File:</strong> {selectedFile.name}
          {filePreview && <img src={filePreview} alt="Preview" className="preview-img" />}
        </div>
      )}

      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <label className="file-input-label">
          📁
          <input type="file" accept="image/*,.pdf,.docx" onChange={handleFileChange} hidden />
        </label>

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;










// import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
// import "./Chatbox.css";

// const socket = io("http://localhost:5002"); // Connect to backend WebSocket

// const ChatBox = ({ user, onClose }) => {
//   const [messages, setMessages] = useState([]); // Ensure it's an array
//   const [input, setInput] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);

//   useEffect(() => {
//     // Receive messages from server
//     socket.on("receiveMessage", (message) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//     });

//     return () => {
//       socket.off("receiveMessage"); // Cleanup listener on unmount
//     };
//   }, []);

//   const handleSend = () => {
//     if (input.trim() !== "" || selectedFile) {
//       const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
//       const newMessage = {
//         text: input,
//         sender: "You",
//         file: fileUrl,
//         fileName: selectedFile ? selectedFile.name : null,
//       };

//       setMessages([...messages, newMessage]); // Update UI
//       socket.emit("sendMessage", newMessage); // Send message to server

//       setInput("");
//       setSelectedFile(null);
//       setFilePreview(null);
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       if (file.type.startsWith("image/")) {
//         setFilePreview(URL.createObjectURL(file));
//       } else {
//         setFilePreview(null);
//       }
//     }
//   };

//   return (
//     <div className="chat-box">
//       <div className="chat-header">
//         <span>Chat with {user}</span>
//         <button onClick={onClose}>&times;</button>
//       </div>

//       <div className="chat-body">
//         {Array.isArray(messages) &&
//           messages.map((msg, index) => (
//             <div key={index} className={`message ${msg.sender === "You" ? "user" : "bot"}`}>
//               <strong>{msg.sender}:</strong> {msg.text}
//               {msg.file && (
//                 <div className="file-preview">
//                   {msg.fileName.match(/\.(jpeg|jpg|png|gif)$/i) ? (
//                     <img src={msg.file} alt="Uploaded" />
//                   ) : (
//                     <a href={msg.file} download={msg.fileName}>{msg.fileName}</a>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//       </div>

//       {/* File Preview */}
//       {selectedFile && (
//         <div className="file-preview-container">
//           <strong>File:</strong> {selectedFile.name}
//           {filePreview && <img src={filePreview} alt="Preview" className="preview-img" />}
//         </div>
//       )}

//       <div className="chat-footer">
//         <input
//           type="text"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />

//         <label className="file-input-label">
//           📁
//           <input type="file" accept="image/*,.pdf,.docx" onChange={handleFileChange} hidden />
//         </label>

//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;


