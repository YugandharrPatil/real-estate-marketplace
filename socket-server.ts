import { createServer } from "http";
import { Server } from "socket.io";
import postgres from "postgres";

const PORT = 3001;

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinChat", (chatId: string) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on(
    "sendMessage",
    async (data: {
      chatId: string;
      senderId: string;
      senderRole: string;
      content: string;
    }) => {
      try {
        const [message] = await sql`
          INSERT INTO re_messages (chat_id, sender_id, sender_role, content)
          VALUES (${data.chatId}, ${data.senderId}, ${data.senderRole}, ${data.content})
          RETURNING *
        `;

        // Update chat's updated_at
        await sql`
          UPDATE re_chats SET updated_at = NOW() WHERE id = ${data.chatId}
        `;

        io.to(data.chatId).emit("newMessage", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
