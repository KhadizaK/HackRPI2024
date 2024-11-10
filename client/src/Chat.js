import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };


  useEffect(() => {
    const handleUserJoined = (data) => {
      const joinMessage = {
        author: `Chat: ${room}`,
        message: `${data.username} has joined the chat.`,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };
      setMessageList((list) => [...list, joinMessage]);
    };
  
    socket.on("user_joined", handleUserJoined);
  
    // Cleanup to prevent duplicate listeners
    return () => {
      socket.off("user_joined", handleUserJoined);
    };
  }, []);
  

  useEffect(() => {
    const handleMessageReceive = (data) => {
      setMessageList((list) => [...list, data]);
    };
  
    socket.on("receive_message", handleMessageReceive);
  
    // Cleanup function to remove the event listener on component unmount
    return () => {
      socket.off("receive_message", handleMessageReceive);
    };
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;