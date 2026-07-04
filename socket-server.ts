import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { db } from "./src/db";
import { reChats, reMessages } from "./src/db/schema";
import { eq } from "drizzle-orm";

const PORT = 3001;

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

  // Handle client-emitted message (when saved via server actions)
  socket.on("messageSent", (data: { chatId: string; message: any }) => {
    io.to(data.chatId).emit("newMessage", data.message);
    io.emit("chatUpdated"); // Notify admin chat list to re-fetch
  });

  socket.on(
    "sendMessage",
    async (data: {
      chatId: string;
      senderId: string;
      senderRole: "user" | "admin";
      content: string;
    }) => {
      try {
        const [message] = await db.insert(reMessages)
          .values({
            chat_id: data.chatId,
            sender_id: data.senderId,
            sender_role: data.senderRole,
            content: data.content,
          })
          .returning();

        // Update chat's updated_at
        await db.update(reChats)
          .set({ updated_at: new Date().toISOString() })
          .where(eq(reChats.id, data.chatId));

        io.to(data.chatId).emit("newMessage", message);
        io.emit("chatUpdated"); // Notify admin chat list
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
