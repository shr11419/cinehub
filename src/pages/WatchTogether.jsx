import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  listenToRoom,
  updatePlayback,
  sendMessage,
  leaveRoom,
} from "../api/watchTogether";
import { getArchiveEmbedUrl } from "../api/archive";
import {
  FiSend, FiLogOut, FiUsers, FiCopy,
  FiCheck, FiUpload, FiPlay, FiPause,
  FiVolume2, FiVolumeX, FiMaximize,
  FiSkipBack, FiSkipForward
} from "react-icons/fi";

export default function WatchTogether() {
  const { roomCode } = useParams();
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "Guest";
  const navigate = useNavigate();

  // room state from Firebase
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);

  // chat
  const [msgInput, setMsgInput] = useState("");

  // UI
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // local file player state
  const [localUrl, setLocalUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // this flag stops a sync loop
  // when WE receive a Firebase update and seek the video,
  // we don't want to ALSO fire another Firebase update
  const isSyncing = useRef(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);
  const controlsTimer = useRef(null);
  const lastSyncTime = useRef(0); // throttle sync updates

  // ===== FIREBASE LISTENER =====
  useEffect(() => {
    const unsubscribe = listenToRoom(roomCode, (roomData) => {
      setRoom(roomData);

      // convert messages
      const msgs = roomData.messages
        ? Object.entries(roomData.messages)
            .map(([id, msg]) => ({ id, ...msg }))
            .sort((a, b) => a.time - b.time)
        : [];
      setMessages(msgs);

      // convert members
      const mems = roomData.members
        ? Object.keys(roomData.members).filter(k => roomData.members[k])
        : [];
      setMembers(mems);

      // ===== SYNC PLAYBACK FROM FIREBASE =====
      // when another person plays/pauses/seeks,
      // Firebase updates and this fires
      if (videoRef.current && localUrl) {
        isSyncing.current = true;

        // sync play/pause
        if (roomData.isPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
          setPlaying(true);
        } else if (!roomData.isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
          setPlaying(false);
        }

        // sync seek position
        // only seek if difference is more than 2 seconds
        // (avoids constant tiny corrections)
        const timeDiff = Math.abs(videoRef.current.currentTime - roomData.currentTime);
        if (timeDiff > 2) {
          videoRef.current.currentTime = roomData.currentTime;
          setCurrentTime(roomData.currentTime);
        }

        // release sync flag after a short delay
        setTimeout(() => { isSyncing.current = false; }, 500);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      leaveRoom(roomCode, userName);
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [roomCode, userName, localUrl]);

  // scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== FILE SELECT =====
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    setFileName(file.name);
  }

  // ===== PLAYER CONTROLS =====
  // these update Firebase so the other person syncs too

  async function togglePlay() {
    if (!videoRef.current) return;
    const newPlaying = !playing;

    if (newPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setPlaying(newPlaying);

    // update Firebase — other person will sync
    await updatePlayback(roomCode, newPlaying, videoRef.current.currentTime);
  }

  // throttle seek updates to Firebase
  // we don't want to spam Firebase on every pixel drag
  async function handleSeek(e) {
    const newTime = (e.target.value / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    // only update Firebase every 500ms during seeking
    const now = Date.now();
    if (now - lastSyncTime.current > 500) {
      lastSyncTime.current = now;
      await updatePlayback(roomCode, playing, newTime);
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // sync every 5 seconds automatically
    // catches any drift between the two players
    const now = Date.now();
    if (now - lastSyncTime.current > 5000 && !isSyncing.current) {
      lastSyncTime.current = now;
      updatePlayback(roomCode, !videoRef.current.paused, videoRef.current.currentTime);
    }
  }

  function handleVolume(e) {
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setMuted(val === 0);
  }

  function toggleMute() {
    videoRef.current.muted = !muted;
    setMuted(!muted);
  }

  function skip(seconds) {
    const newTime = videoRef.current.currentTime + seconds;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    updatePlayback(roomCode, playing, newTime);
  }

  function handleFullscreen() {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }

  // ===== CHAT =====
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!msgInput.trim()) return;
    await sendMessage(roomCode, userName, msgInput.trim());
    setMsgInput("");
  }

  // ===== LEAVE =====
  async function handleLeave() {
    await leaveRoom(roomCode, userName);
    navigate("/");
  }

  // ===== COPY CODE =====
  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ===== FORMAT TIME =====
  function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="spinner" />
        <p>Connecting to room {roomCode}...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="watch-loading">
        <p>Room not found!</p>
        <button onClick={() => navigate("/")} className="browse-btn">Go Home</button>
      </div>
    );
  }

  // decide what video source to use:
  // local file > archive > youtube
  const embedSrc = !localUrl
    ? room.archiveId
      ? getArchiveEmbedUrl(room.archiveId)
      : room.videoKey
        ? `https://www.youtube.com/embed/${room.videoKey}?autoplay=1&rel=0`
        : null
    : null;

  return (
    <div className="watch-page">

      {/* TOP BAR */}
      <div className="watch-topbar">
        <div className="watch-topbar-left">
          <span className="watch-movie-name">🎬 {room.movieTitle}</span>
          <div className="watch-room-code" onClick={copyCode}>
            <span>Room: <strong>{roomCode}</strong></span>
            {copied ? <FiCheck size={14} color="#00c864" /> : <FiCopy size={14} />}
          </div>
          {/* show what's playing */}
          {localUrl && (
            <span className="source-badge free">📁 Local File</span>
          )}
          {!localUrl && embedSrc && (
            <span className="source-badge trailer">
              {room.archiveId ? "🎬 Archive" : "🎞️ Trailer"}
            </span>
          )}
        </div>

        <div className="watch-topbar-right">
          <div className="watch-members">
            <FiUsers size={14} />
            <span>{members.length} watching</span>
            <div className="members-list">
              {members.map(m => (
                <span key={m} className={`member-chip ${m === userName ? "you" : ""}`}>
                  {m} {m === room.host ? "👑" : ""}
                </span>
              ))}
            </div>
          </div>
          <button className="watch-leave-btn" onClick={handleLeave}>
            <FiLogOut size={16} /> Leave
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="watch-main">

        {/* VIDEO SIDE */}
        <div className="watch-player-area">

          {/* LOCAL FILE PLAYER */}
          {localUrl ? (
            <div
              className="local-video-container watch-video-container"
              onMouseMove={handleMouseMove}
            >
              <video
                ref={videoRef}
                src={localUrl}
                className="local-video"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />

              <div className={`local-controls ${showControls ? "visible" : "hidden"}`}>
                <div className="progress-area">
                  <span className="time-label">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    className="progress-bar"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                  />
                  <span className="time-label">{formatTime(duration)}</span>
                </div>

                <div className="controls-row">
                  <div className="controls-left">
                    <button className="ctrl-btn" onClick={() => skip(-10)}>
                      <FiSkipBack size={18} />
                    </button>
                    <button className="ctrl-btn play-pause" onClick={togglePlay}>
                      {playing
                        ? <FiPause size={22} fill="white" />
                        : <FiPlay size={22} fill="white" />}
                    </button>
                    <button className="ctrl-btn" onClick={() => skip(10)}>
                      <FiSkipForward size={18} />
                    </button>
                    <button className="ctrl-btn" onClick={toggleMute}>
                      {muted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      className="volume-bar"
                      min="0" max="1" step="0.05"
                      value={muted ? 0 : volume}
                      onChange={handleVolume}
                    />
                    <span className="time-label" style={{ color: "white" }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="controls-right">
                    {/* switch file button */}
                    <button
                      className="ctrl-btn"
                      onClick={() => fileInputRef.current.click()}
                      title="Change file"
                    >
                      <FiUpload size={16} />
                    </button>
                    <button className="ctrl-btn" onClick={handleFullscreen}>
                      <FiMaximize size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* hidden file input for switching */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </div>

          ) : embedSrc ? (
            // YOUTUBE / ARCHIVE EMBED (fallback)
            <iframe
              src={embedSrc}
              className="watch-iframe"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={room.movieTitle}
            />
          ) : (
            // NO VIDEO — show file picker
            <div className="watch-file-picker">
              <FiUpload size={40} color="#666" />
              <p>No video source available</p>
            </div>
          )}

          {/* LOAD LOCAL FILE BANNER — always visible */}
          <div className="watch-local-banner">
            <div className="watch-local-left">
              {localUrl ? (
                <>
                  <span className="local-file-name">📁 {fileName}</span>
                  <span className="local-sync-status">🟢 Synced with room</span>
                </>
              ) : (
                <span className="local-prompt">
                  Have the movie file? Load it for better quality + sync with friends
                </span>
              )}
            </div>
            <button
              className="watch-load-file-btn"
              onClick={() => fileInputRef.current?.click() || document.getElementById("watch-file-input").click()}
            >
              <FiUpload size={14} />
              {localUrl ? "Change File" : "Load Movie File"}
            </button>
            <input
              id="watch-file-input"
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>

          {/* SHARE BANNER */}
          <div className="watch-share-banner">
            <span>📨 Share code with friends:</span>
            <div className="watch-code-pill" onClick={copyCode}>
              <strong>{roomCode}</strong>
              {copied ? <FiCheck size={14} color="#00c864" /> : <FiCopy size={14} />}
            </div>
            <span className="watch-share-hint">
              They join → load their own copy of the movie → plays in sync!
            </span>
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="watch-chat">
          <div className="watch-chat-header">
            <span>💬 Live Chat</span>
            <span className="watch-chat-count">{members.length} online</span>
          </div>

          <div className="watch-messages">
            {messages.length === 0 && (
              <p className="watch-no-msgs">No messages yet. Say hi! 👋</p>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`watch-msg ${msg.user === userName ? "mine" : "theirs"}`}
              >
                {msg.user !== userName && (
                  <span className="watch-msg-user">{msg.user}</span>
                )}
                <div className="watch-msg-bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          <form className="watch-chat-input" onSubmit={handleSendMessage}>
            <input
              className="watch-input"
              placeholder="Say something..."
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
            />
            <button
              type="submit"
              className="watch-send-btn"
              disabled={!msgInput.trim()}
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}