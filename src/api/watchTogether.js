import { db } from "../firebase";
import {
    ref, 
    set,
    get,
    update,
    push,
    onValue,
    off,
    serverTimestamp
} from "firebase/database";

export function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "CINE-";
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

//creates a new watch room it is called when host clicks on watch together
export async function createRoom(roomCode, movie, videoKey, archiveId, hostName) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await set(roomRef, {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path || "",
        videoKey: videoKey || "",
        archiveId: archiveId || "",
        isPlaying: false,
        currentTime: 0,
        lastUpdated: serverTimestamp(),
        host: hostName,
        members: {
            [hostName]: true
        },
        messages: {}
    });
}

//join an existing room, called when guest enters a code
export async function joinRoom(roomCode, userName) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snap = await get(roomRef);

    if (!snap.exists()) {
        return { success: false, error: "Room not found. Check the code"};
    }

    await update(ref(db, `rooms/${roomCode}/members`), {
        [userName] : true
    });

    return { success: true, room: snap.val()};
}

//update playback state- called on play pause seek
export async function updatePlayback(roomCode, isPlaying, currentTime){
    await update(ref(db, `rooms/${roomCode}`), {
        isPlaying,
        currentTime,
        lastUpdated:serverTimestamp(),
    });
}

//send a chat msg
export async function sendMessage(roomCode, userName, text) {
    const messageRef = ref(db, `rooms/${roomCode}/messages`);
    await push(messageRef, {
        user: userName,
        text,
        time: Date.now(),
    });
}

//listen to room changes in real time
export function listenToRoom(roomCode, callback) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    onValue(roomRef, (snap) => {
        if (snap.exists()) callback(snap.val());
    });

    //return unsubscribe fnct call it on cleanup
    return () => off(roomRef); 
}

//leave room remove user from members
export async function leaveRoom(roomCode, userName) {
    await update(ref(db, `rooms/${roomCode}/members`), {
        [userName]: null 
    });
}