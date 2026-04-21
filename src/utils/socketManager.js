const userSocketMap = new Map();

// add user
const addUser = (userId, socketId) => {
  userSocketMap.set(userId, socketId);
};

// remove user
const removeUser = (socketId) => {
  for (let [userId, sId] of userSocketMap.entries()) {
    if (sId === socketId) {
      userSocketMap.delete(userId);
      break;
    }
  }
};

// get socket by userId
const getSocket = (userId) => {
  return userSocketMap.get(userId);
};

module.exports = {
  addUser,
  removeUser,
  getSocket,
};