/**
 * Graduation Invitation - Interactive Ghibli Cinematic Experience
 * Tân Kỹ sư: Nguyễn Thế Đạt • HUBT Khóa 27 (2022 - 2026)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. DOM REFERENCES (DECLARED FIRST)
  // ==========================================
  // Screens
  const screenLetter = document.getElementById('screen-letter-write');
  const screenCinema = document.getElementById('screen-cinema');
  const screenMain = document.getElementById('screen-main-content');
  const modalRsvp = document.getElementById('modal-rsvp-popup');

  // Screen 1: Desk & Letter
  const ghibliRoomBackdrop = document.getElementById('ghibli-room-backdrop');
  const lobbyDeskStage = document.getElementById('lobby-desk-stage');
  const waitingDeskLetterHotspot = document.getElementById('waiting-desk-letter-hotspot');
  const idleHintMessage = document.getElementById('idle-hint-message');
  const landscapeDeskContainer = document.getElementById('landscape-desk-container');
  const letterSheet = document.getElementById('letter-landscape-sheet');
  const panelTop = document.getElementById('panel-top');
  const panelBottom = document.getElementById('panel-bottom');
  const guestNameInput = document.getElementById('guest-name-input');
  const penNib = document.getElementById('calligraphy-pen-nib');
  const btnPackLetter = document.getElementById('btn-pack-letter');
  const receiverEnvelope = document.getElementById('receiver-envelope');
  const envFlapTop = document.getElementById('env-flap-top');
  const envWaxStamp = document.getElementById('env-wax-stamp');
  const packingHint = document.getElementById('packing-hint-text');

  // Top Navigation & Back Button
  const backControlContainer = document.getElementById('back-control-container');
  const btnBackToLobby = document.getElementById('btn-back-to-lobby');
  const musicToggleBtn = document.getElementById('music-toggle-btn');

  // Screen 2: Cinema
  const video = document.getElementById('graduation-video');
  const btnBigPlay = document.getElementById('btn-big-play');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const videoSeek = document.getElementById('video-seek');
  const videoProgressFill = document.getElementById('video-progress-fill');
  const videoTimeDisplay = document.getElementById('video-time-display');
  const btnMuteToggle = document.getElementById('btn-mute-toggle');
  const btnFullscreenToggle = document.getElementById('btn-fullscreen-toggle');
  const btnQuickFullscreen = document.getElementById('btn-quick-fullscreen');
  const btnSkipCinema = document.getElementById('btn-skip-cinema');

  // Screen 3: RSVP Modal
  const modalGuestDisplay = document.getElementById('modal-guest-display');
  const btnRsvpYes = document.getElementById('btn-rsvp-yes');
  const btnRsvpNo = document.getElementById('btn-rsvp-no');
  const modalGuestWish = document.getElementById('modal-guest-wish');
  const btnModalConfirm = document.getElementById('btn-modal-confirm');

  // Screen 4: Main Content
  const rsvpBanner = document.getElementById('rsvp-status-banner');
  const rsvpStatusText = document.getElementById('rsvp-status-text');
  const rsvpStatusSub = document.getElementById('rsvp-status-sub');
  const dynamicNameSpans = document.querySelectorAll('.dynamic-name, .invitation-guest-name');
  const daysVal = document.getElementById('days-val');
  const hoursVal = document.getElementById('hours-val');
  const minsVal = document.getElementById('mins-val');
  const secsVal = document.getElementById('secs-val');

  // Mascot & Confetti
  const mascotBubble = document.getElementById('mascot-bubble');
  const mascotWidget = document.getElementById('mascot-widget');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // ==========================================
  // 2. STATE MANAGEMENT & INITIAL RESET
  // ==========================================
  const state = {
    guestName: '',
    rsvpStatus: 'yes', // 'yes' | 'no'
    guestWish: '',
    isLetterOpened: false,
    isWriting: false,
    isPlayingMusic: false,
    audioInitialized: false
  };

  // Đảm bảo ô nhập tên luôn TRỐNG HOÀN TOÀN từ đầu (không có bất kỳ chữ gì điền sẵn)
  localStorage.removeItem('hubt_guest_name');
  if (guestNameInput) {
    guestNameInput.value = '';
    guestNameInput.setAttribute('spellcheck', 'false');
    guestNameInput.setAttribute('autocorrect', 'off');
    guestNameInput.setAttribute('autocomplete', 'off');
  }

  // Khởi tạo Canvas đo lường độ dài chữ viết tay để bút lông chạy theo mượt mà
  const textCanvas = document.createElement('canvas');
  const textCtx = textCanvas.getContext('2d');
  if (textCtx) {
    textCtx.font = '30px "Dancing Script", cursive';
  }

  // ==========================================
  // 3. CHUYỂN ĐỔI MÀN HÌNH VÀ CẬP NHẬT TÊN KHÁCH
  // ==========================================
  function switchScreen(fromScreen, toScreen) {
    if (fromScreen) fromScreen.classList.remove('active');
    if (toScreen) {
      toScreen.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (toScreen.id === 'screen-cinema') {
        document.body.classList.add('cinema-screen-active');
      } else {
        document.body.classList.remove('cinema-screen-active');
      }
    }
  }

  function updateDynamicNames(name) {
    const finalName = name && name.trim() ? name.trim() : '';
    state.guestName = finalName;
    if (finalName) {
      localStorage.setItem('hubt_guest_name', finalName);
    }
    const displayName = finalName || 'bạn';
    if (modalGuestDisplay) modalGuestDisplay.textContent = displayName;
    if (dynamicNameSpans && dynamicNameSpans.length > 0) {
      dynamicNameSpans.forEach(el => { el.textContent = displayName; });
    }
  }

  // ==========================================
  // 4. HIỆU ỨNG ÂM THANH MƯỢT MÀ (WEB AUDIO API)
  // ==========================================
  let audioCtx = null;

  function initAudioCtx() {
    try {
      if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtx = new AudioCtx();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  function playOpenChime() {
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 0.5);
      });
    } catch (e) {}
  }

  function playPenScratchSound() {
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 + Math.random() * 40, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.07);
    } catch (e) {}
  }

  function playFoldSound() {
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(170, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.21);
    } catch (e) {}
  }

  function playWaxStampSound() {
    try {
      if (!audioCtx || audioCtx.state !== 'running') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.26);
    } catch (e) {}
  }

  // =========================================================================
  // 5. KHU CHỜ BAN ĐẦU: CHẠM VÀO THƯ TRÊN BÀN -> ZOOM IN VÀ MỞ LÁ THƯ
  // =========================================================================
  function revealOpenedLetterFromLobby() {
    if (state.isLetterOpened) return;
    state.isLetterOpened = true;

    initAudioCtx();
    playOpenChime();

    // 1. Luôn đảm bảo ô nhập tên trống 100% khi vừa mở thư
    if (guestNameInput) {
      guestNameInput.value = '';
    }
    if (penNib) {
      penNib.style.setProperty('--pen-x', '0px');
    }

    // 2. Tắt gợi ý và dừng gió thu mạnh
    stopWindGusts();
    dismissIdleHint();

    // 3. Zoom In bàn học điện ảnh & hiện nút quay lại
    if (screenLetter) {
      screenLetter.classList.add('screen-letter-zoomed', 'cinematic-focus');
    }
    if (backControlContainer) {
      backControlContainer.classList.add('visible');
    }

    // 4. Ẩn phong thư trên bàn học mượt mà
    if (lobbyDeskStage) {
      lobbyDeskStage.classList.add('hidden-stage');
      setTimeout(() => {
        lobbyDeskStage.style.display = 'none';
      }, 550);
    }

    // 5. Hiển thị lá thư khổ ngang mở ra thẳng thớm
    if (landscapeDeskContainer) {
      landscapeDeskContainer.style.display = 'flex';
      landscapeDeskContainer.style.opacity = '0';
      landscapeDeskContainer.style.transform = 'scale(0.85) translateY(35px)';
      landscapeDeskContainer.style.transition = 'opacity 0.75s cubic-bezier(0.2, 0.85, 0.25, 1), transform 0.75s cubic-bezier(0.2, 0.85, 0.25, 1)';
      
      requestAnimationFrame(() => {
        landscapeDeskContainer.style.opacity = '1';
        landscapeDeskContainer.style.transform = 'scale(1) translateY(0)';
      });
    }

    // Đảm bảo phong bì origami đang ẩn
    if (receiverEnvelope) {
      receiverEnvelope.style.display = 'none';
    }

    if (mascotBubble) {
      mascotBubble.textContent = 'Lá thư đã mở ra rồi nè! Cậu chạm vào dòng "Thân gửi" để viết tên nhé! ✨';
    }
  }

  // Gắn sự kiện click và bàn phím cho phong thư trên bàn học
  if (waitingDeskLetterHotspot) {
    waitingDeskLetterHotspot.addEventListener('click', revealOpenedLetterFromLobby);
    waitingDeskLetterHotspot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        revealOpenedLetterFromLobby();
      }
    });
  }

  // =========================================================================
  // 6. QUAY LẠI SẢNH CHỜ BÀN HỌC (ZOOM OUT TRỞ VỀ TOÀN CẢNH)
  // =========================================================================
  function backToLobbyDesk() {
    if (!state.isLetterOpened) return;
    state.isLetterOpened = false;
    exitWritingMode();

    // Ẩn nút quay lại
    if (backControlContainer) {
      backControlContainer.classList.remove('visible');
    }

    // 1. Zoom Out điện ảnh bàn học trở về toàn cảnh
    if (screenLetter) {
      screenLetter.classList.remove('screen-letter-zoomed', 'cinematic-focus');
    }

    // 2. Khép lá thư lại mượt mà
    if (landscapeDeskContainer) {
      landscapeDeskContainer.style.opacity = '0';
      landscapeDeskContainer.style.transform = 'scale(0.8) translateY(35px)';
      landscapeDeskContainer.style.transition = 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.2, 0.85, 0.25, 1)';
      setTimeout(() => {
        landscapeDeskContainer.style.display = 'none';
      }, 550);
    }

    // 3. Hiện lại sảnh chờ và phong thư với viền sáng nhịp thở
    if (lobbyDeskStage) {
      lobbyDeskStage.style.display = 'block';
      setTimeout(() => {
        lobbyDeskStage.classList.remove('hidden-stage');
        lobbyDeskStage.style.opacity = '1';
      }, 40);
    }

    // Xóa sạch ô nhập tên để lần sau mở ra luôn trống 100%
    if (guestNameInput) {
      guestNameInput.value = '';
    }
    if (penNib) {
      penNib.style.setProperty('--pen-x', '0px');
    }

    // Khởi động lại luồng gió thu và timer nhắc nhở sau 7s
    scheduleNextWindGust();
    startIdleHintTimer();

    if (mascotBubble) {
      mascotBubble.textContent = 'Cậu cứ thoải mái ngắm góc bàn học nhé! Chạm vào bức thư bất kỳ lúc nào để mở! ✨';
    }
  }

  if (btnBackToLobby) {
    btnBackToLobby.addEventListener('click', backToLobbyDesk);
  }

  // =========================================================================
  // 7. CHẠM VÀO Ô NHẬP TÊN - CINEMATIC MACRO TRACKING & VIẾT CHỮ
  // =========================================================================
  function enterWritingMode() {
    state.isWriting = true;
    initAudioCtx();

    if (screenLetter) {
      screenLetter.classList.add('writing-mode-active');
    }

    if (mascotBubble) {
      mascotBubble.textContent = 'Đang nắn nót viết từng nét tên cậu lên lá thư... ✍️';
    }

    updatePenAndCamera();
  }

  function exitWritingMode() {
    state.isWriting = false;
    if (screenLetter) {
      screenLetter.classList.remove('writing-mode-active');
    }
    if (letterSheet) {
      letterSheet.style.removeProperty('--camera-pan-x');
      letterSheet.style.removeProperty('--camera-pan-y');
      letterSheet.style.removeProperty('--camera-zoom');
    }
    if (mascotBubble && state.guestName) {
      mascotBubble.textContent = `Tên "${state.guestName}" viết lên thư nhìn đẹp quá! Bấm nút "Gói lại" nha! ✨`;
    }
  }

  function updatePenAndCamera() {
    if (!guestNameInput) return;
    const val = guestNameInput.value;
    const textWidth = val && textCtx ? textCtx.measureText(val).width : 0;

    // 1. Ngòi bút lông chạy theo chữ nhẹ nhàng, giới hạn không vượt quá mép ô nhập
    if (penNib) {
      const containerWidth = guestNameInput.offsetWidth || 260;
      const clampedX = Math.min(textWidth + 4, Math.max(0, containerWidth - 26));
      penNib.style.setProperty('--pen-x', clampedX + 'px');
      penNib.classList.remove('pen-stroke');
      requestAnimationFrame(() => {
        if (penNib) penNib.classList.add('pen-stroke');
      });
    }

    // 2. GIỮ LÁ THƯ ỔN ĐỊNH Ở TRUNG TÂM, TUYỆT ĐỐI KHÔNG TRƯỢT SANG TRÁI, KHÔNG ZOOM LÀM MẤT CHỮ
    if (letterSheet) {
      letterSheet.style.setProperty('--camera-pan-x', '0px');
      letterSheet.style.setProperty('--camera-pan-y', '0px');
      letterSheet.style.setProperty('--camera-zoom', '1');
    }

    playPenScratchSound();
  }

  if (guestNameInput) {
    guestNameInput.addEventListener('focus', () => {
      enterWritingMode();
      setTimeout(() => {
        try {
          guestNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {}
      }, 250);
    });
    guestNameInput.addEventListener('click', enterWritingMode);

    guestNameInput.addEventListener('input', (e) => {
      const val = e.target.value;
      updateDynamicNames(val);
      updatePenAndCamera();
    });

    guestNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        guestNameInput.blur();
        exitWritingMode();
        packLetterAndGoToCinema();
      }
    });

    guestNameInput.addEventListener('blur', () => {
      if (!isPacking) exitWritingMode();
    });
  }


  // =========================================================================
  // 8. GẤP THƯ ORIGAMI & NÚT "GÓI LẠI"
  // =========================================================================
  let isPacking = false;

  function packLetterAndGoToCinema() {
    if (isPacking) return;
    isPacking = true;
    initAudioCtx();

    exitWritingMode();

    // Ẩn nút quay lại khi bắt đầu gói thư
    if (backControlContainer) {
      backControlContainer.classList.remove('visible');
    }

    const inputVal = guestNameInput ? guestNameInput.value.trim() : '';
    const finalGuestName = inputVal || 'Bạn thân mến';
    updateDynamicNames(finalGuestName);

    if (mascotBubble) {
      mascotBubble.textContent = `Đang nắn nót gói lá thư cho ${state.guestName}... ✉️`;
    }
    if (packingHint) {
      packingHint.textContent = 'Đang gấp các nếp thư và cho vào phong bì niêm phong...';
    }

    // Chiếc phong bì xuất hiện trượt ra bên dưới
    if (receiverEnvelope) {
      receiverEnvelope.style.display = 'flex';
      receiverEnvelope.style.opacity = '0';
      receiverEnvelope.style.transform = 'translateY(30px)';
      receiverEnvelope.style.transition = 'all 0.5s ease-out';
      requestAnimationFrame(() => {
        receiverEnvelope.style.opacity = '1';
        receiverEnvelope.style.transform = 'translateY(0)';
      });
    }

    // Kích hoạt chế độ gấp: triệt tiêu viền cũ, chuẩn bị 3 nếp gấp giấy
    if (letterSheet) {
      letterSheet.classList.add('folding-mode');
    }

    // Step 1: Nếp dưới gập lên (0.3s)
    setTimeout(() => {
      playFoldSound();
      if (panelBottom) panelBottom.classList.add('folded');
    }, 300);

    // Step 2: Nếp trên gập úp xuống (1.0s)
    setTimeout(() => {
      playFoldSound();
      if (panelTop) panelTop.classList.add('folded');
    }, 1000);

    // Step 3: Thu nhỏ cả lá thư đã gập vừa vặn với kích thước phong bì (1.8s)
    setTimeout(() => {
      if (letterSheet) {
        letterSheet.classList.add('folded-compact');
      }
    }, 1800);

    // Step 4: Lá thư đã thu nhỏ trượt nhét sâu vào miệng phong bì (2.6s)
    setTimeout(() => {
      if (letterSheet) {
        letterSheet.classList.add('sliding-into-envelope');
      }
    }, 2600);

    // Step 5: Nắp phong bì khép lại (3.3s)
    setTimeout(() => {
      playFoldSound();
      if (envFlapTop) envFlapTop.classList.add('closed');
    }, 3300);

    // Step 6: Đóng dấu triện sáp đỏ (3.9s)
    setTimeout(() => {
      playWaxStampSound();
      if (envWaxStamp) envWaxStamp.classList.add('stamped');
      if (mascotBubble) mascotBubble.textContent = 'Đã niêm phong! Mời bạn thưởng thức Vlog nhé! 🎬';
    }, 3900);

    // Step 7: Chuyển sang Màn hình 2 (Cinema) (4.7s)
    setTimeout(() => {
      if (screenLetter) {
        screenLetter.classList.remove('screen-letter-zoomed', 'cinematic-focus');
      }
      switchScreen(screenLetter, screenCinema);
      startCinemaPlayback();
    }, 4700);
  }

  if (btnPackLetter) {
    btnPackLetter.addEventListener('click', packLetterAndGoToCinema);
  }

  // =========================================================================
  // 9. SCREEN 2: CINEMA VLOG PLAYBACK
  // =========================================================================
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function startCinemaPlayback() {
    if (!video) return;
    if (mascotBubble) mascotBubble.textContent = 'Mời bạn xem thước phim thanh xuân 4 năm của Đạt nha! 🎞️';

    // 1. Tắt nhạc nền nếu đang phát để tránh lẫn tiếng vào video
    if (isChillTunePlaying) {
      toggleMusic();
    }

    // 2. Ẩn nút phát nhạc đĩa than
    const audioContainer = document.getElementById('audio-control-container');
    if (audioContainer) {
      audioContainer.style.display = 'none';
    }

    // 3. Hiện nút 'Bỏ qua' ở góc trên bên phải thay thế
    const skipContainer = document.getElementById('skip-control-container');
    if (skipContainer) {
      skipContainer.style.display = 'flex';
    }

    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (btnBigPlay) btnBigPlay.style.display = 'none';
          if (btnPlayPause) btnPlayPause.textContent = '⏸';
        })
        .catch(() => {
          if (btnBigPlay) btnBigPlay.style.display = 'flex';
          if (btnPlayPause) btnPlayPause.textContent = '▶';
        });
    }
  }

  if (btnBigPlay && video) {
    btnBigPlay.addEventListener('click', () => {
      video.play();
      btnBigPlay.style.display = 'none';
      if (btnPlayPause) btnPlayPause.textContent = '⏸';
    });
  }

  if (btnPlayPause && video) {
    btnPlayPause.addEventListener('click', () => {
      if (video.paused || video.ended) {
        video.play();
        btnPlayPause.textContent = '⏸';
        if (btnBigPlay) btnBigPlay.style.display = 'none';
      } else {
        video.pause();
        btnPlayPause.textContent = '▶';
        if (btnBigPlay) btnBigPlay.style.display = 'flex';
      }
    });
  }

  if (video) {
    let isSeeking = false;

    video.addEventListener('timeupdate', () => {
      if (!isSeeking && !isNaN(video.duration) && video.duration > 0) {
        const pct = (video.currentTime / video.duration) * 100;
        if (videoSeek) videoSeek.value = pct;
        if (videoProgressFill) videoProgressFill.style.width = `${pct}%`;
        if (videoTimeDisplay) {
          videoTimeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
      }
    });

    if (videoSeek) {
      videoSeek.addEventListener('input', () => {
        isSeeking = true;
        if (!isNaN(video.duration) && video.duration > 0) {
          const seekTime = (parseFloat(videoSeek.value) / 100) * video.duration;
          if (videoProgressFill) videoProgressFill.style.width = `${videoSeek.value}%`;
          if (videoTimeDisplay) {
            videoTimeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(video.duration)}`;
          }
        }
      });

      videoSeek.addEventListener('change', () => {
        if (!isNaN(video.duration) && video.duration > 0) {
          const seekTime = (parseFloat(videoSeek.value) / 100) * video.duration;
          video.currentTime = seekTime;
        }
        setTimeout(() => { isSeeking = false; }, 200);
      });
    }

    const timelineWrap = document.querySelector('.timeline-bar-wrap');
    if (timelineWrap) {
      function seekFromEvent(e) {
        if (!video || isNaN(video.duration) || video.duration <= 0) return;
        const rect = timelineWrap.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const seekTime = pos * video.duration;
        video.currentTime = seekTime;
        if (videoSeek) videoSeek.value = pos * 100;
        if (videoProgressFill) videoProgressFill.style.width = `${pos * 100}%`;
        if (videoTimeDisplay) {
          videoTimeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(video.duration)}`;
        }
      }

      timelineWrap.addEventListener('click', (e) => {
        isSeeking = true;
        seekFromEvent(e);
        setTimeout(() => { isSeeking = false; }, 200);
      });
    }

    if (btnMuteToggle) {
      btnMuteToggle.addEventListener('click', () => {
        video.muted = !video.muted;
        btnMuteToggle.textContent = video.muted ? '🔇' : '🔊';
      });
    }

  function enterCinemaFullscreen() {
    const playerBox = document.querySelector('.cinema-player-box') || video;
    document.body.classList.add('cinema-fullscreen-mode');
    if (playerBox) playerBox.classList.add('is-fullscreen');
    if (btnFullscreenToggle) {
      btnFullscreenToggle.textContent = '⤓';
      btnFullscreenToggle.setAttribute('title', 'Thu nhỏ màn hình');
    }

    // Trên iPhone / iPad (iOS Safari): Sử dụng webkitEnterFullscreen trực tiếp trên thẻ video
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && video && video.webkitEnterFullscreen) {
      try {
        video.webkitEnterFullscreen();
        return;
      } catch (err) {}
    }

    const elemToFull = playerBox || document.documentElement;
    if (elemToFull && elemToFull.requestFullscreen) {
      elemToFull.requestFullscreen().catch(() => {
        if (video && video.webkitEnterFullscreen) {
          try { video.webkitEnterFullscreen(); } catch (e) {}
        }
      });
    } else if (playerBox && playerBox.requestFullscreen) {
      playerBox.requestFullscreen().catch(() => {});
    } else if (video && video.webkitEnterFullscreen) {
      try { video.webkitEnterFullscreen(); } catch (e) {}
    } else if (video && video.webkitRequestFullscreen) {
      try { video.webkitRequestFullscreen(); } catch (e) {}
    }
  }

  function exitAnyFullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (e) {}

    document.body.classList.remove('cinema-fullscreen-mode');
    const playerBox = document.querySelector('.cinema-player-box');
    if (playerBox) playerBox.classList.remove('is-fullscreen');
    if (btnFullscreenToggle) {
      btnFullscreenToggle.textContent = '⛶';
      btnFullscreenToggle.setAttribute('title', 'Toàn màn hình');
    }

    // Đảm bảo video không bị đơ hoặc tạm dừng sai sau khi thoát fullscreen
    if (video && video.paused && !video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (btnBigPlay) btnBigPlay.style.display = 'flex';
          if (btnPlayPause) btnPlayPause.textContent = '▶';
        });
      }
    }

    // Đảm bảo sau khi thoát fullscreen sẽ luôn quay về hướng ngang (Landscape) như ban đầu
    if (document.body.classList.contains('mode-phone-frame')) {
      document.body.classList.add('phone-landscape');
      const btnRotate = document.getElementById('btn-rotate-phone-desktop');
      const btnPhone = document.getElementById('btn-device-phone');
      if (btnRotate) btnRotate.classList.add('active');
      if (btnPhone) btnPhone.classList.remove('active');
    }
  }

  // Đồng bộ trạng thái khi người dùng nhấn Esc hoặc phím tắt thoát fullscreen từ trình duyệt
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      exitAnyFullscreen();
    }
  });
  document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
      exitAnyFullscreen();
    }
  });

  // LẮNG NGHE SỰ KIỆN THOÁT FULLSCREEN TRÊN IOS SAFARI (IPHONE / IPAD)
  if (video) {
    video.addEventListener('webkitendfullscreen', () => {
      exitAnyFullscreen();
      // Khôi phục và đảm bảo video phát tiếp mượt mà, không bị đơ
      if (video.paused && !video.ended) {
        const p = video.play();
        if (p !== undefined) {
          p.catch(() => {
            if (btnBigPlay) btnBigPlay.style.display = 'flex';
            if (btnPlayPause) btnPlayPause.textContent = '▶';
          });
        }
      }
    });

    video.addEventListener('webkitbeginfullscreen', () => {
      document.body.classList.add('cinema-fullscreen-mode');
      const playerBox = document.querySelector('.cinema-player-box');
      if (playerBox) playerBox.classList.add('is-fullscreen');
      if (btnFullscreenToggle) {
        btnFullscreenToggle.textContent = '⤓';
        btnFullscreenToggle.setAttribute('title', 'Thu nhỏ màn hình');
      }
    });

    // Đồng bộ nút Play/Pause tự động theo trạng thái thực tế của video
    video.addEventListener('play', () => {
      if (btnPlayPause) btnPlayPause.textContent = '⏸';
      if (btnBigPlay) btnBigPlay.style.display = 'none';
    });

    video.addEventListener('pause', () => {
      if (btnPlayPause) btnPlayPause.textContent = '▶';
      if (btnBigPlay) btnBigPlay.style.display = 'flex';
    });

    video.addEventListener('playing', () => {
      if (btnPlayPause) btnPlayPause.textContent = '⏸';
      if (btnBigPlay) btnBigPlay.style.display = 'none';
    });

    // Chạm trực tiếp vào khung video để Play / Pause tiện lợi
    video.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused || video.ended) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  const toggleFullscreen = () => {
    const isCurrentlyFullscreen = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.body.classList.contains('cinema-fullscreen-mode');
    if (!isCurrentlyFullscreen) {
      enterCinemaFullscreen();
    } else {
      exitAnyFullscreen();
    }
  };

  if (btnFullscreenToggle) {
    btnFullscreenToggle.addEventListener('click', toggleFullscreen);
  }

  video.addEventListener('ended', () => {
    exitAnyFullscreen();
    openRsvpModal();
  });
  }

  const btnSkipCinemaTop = document.getElementById('btn-skip-cinema-top');
  if (btnSkipCinemaTop) {
    btnSkipCinemaTop.addEventListener('click', () => {
      exitAnyFullscreen();
      if (video && !video.paused) video.pause();
      const skipContainer = document.getElementById('skip-control-container');
      if (skipContainer) skipContainer.style.display = 'none';
      openRsvpModal();
    });
  }

  if (btnSkipCinema) {
    btnSkipCinema.addEventListener('click', () => {
      exitAnyFullscreen();
      if (video && !video.paused) video.pause();
      openRsvpModal();
    });
  }

  // =========================================================================
  // 10. SCREEN 3: RSVP MODAL POPUP
  // =========================================================================
  function openRsvpModal() {
    const skipContainer = document.getElementById('skip-control-container');
    if (skipContainer) skipContainer.style.display = 'none';
    if (modalGuestDisplay) modalGuestDisplay.textContent = state.guestName || 'Bạn thân mến';
    if (modalRsvp) {
      modalRsvp.classList.add('active');
      modalRsvp.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }
    if (mascotBubble) {
      mascotBubble.textContent = `${state.guestName || 'Bạn'} ơi, cậu có đến chung vui cùng Đạt không nè? 💐`;
    }
  }

    // ==========================================
  // XỬ LÝ LỰA CHỌN RSVP (ĐỒNG Ý HOẶC TỪ CHỐI) CHUYỂN NGAY LẬP TỨC
  // ==========================================
  function handleRsvpDecision(status) {
    state.rsvpStatus = status;
    if (modalGuestWish) {
      state.guestWish = modalGuestWish.value.trim();
    }
    localStorage.setItem('hubt_rsvp_status', status);
    if (state.guestWish) {
      localStorage.setItem('hubt_guest_wish', state.guestWish);
      const gName = state.guestName || localStorage.getItem('hubt_guest_name') || 'Một người bạn';
      if (typeof WishesDB !== 'undefined' && WishesDB.addWish) {
        WishesDB.addWish(gName, state.guestWish, status);
      }
    }

    // Hiệu ứng phản hồi trên nút vừa bấm
    if (status === 'yes' && btnRsvpYes) {
      btnRsvpYes.classList.add('selected');
      if (btnRsvpNo) btnRsvpNo.classList.remove('selected');
    } else if (status === 'no' && btnRsvpNo) {
      btnRsvpNo.classList.add('selected');
      if (btnRsvpYes) btnRsvpYes.classList.remove('selected');
    }

    // Đóng Modal RSVP sau một nhịp phản hồi thị giác mượt mà (180ms)
    setTimeout(() => {
      if (modalRsvp) {
        modalRsvp.classList.remove('active');
        modalRsvp.setAttribute('aria-hidden', 'true');
        modalRsvp.style.display = 'none';
        document.body.classList.remove('modal-open');
      }

      // Kích hoạt pháo hoa rực rỡ nếu khách chọn Đồng Ý Đến
      if (status === 'yes') {
        fireConfettiDoodle();
      }

      // Chuyển cảnh về lại Bàn học Ghibli và kích hoạt chế độ Khám Phá Bàn Học (Desk Explorer)
      activateDeskExplorerMode(status);
      const audioContainer = document.getElementById('audio-control-container');
      if (audioContainer) {
        audioContainer.style.display = 'flex';
      }

      if (rsvpBanner && rsvpStatusText && rsvpStatusSub) {
        rsvpBanner.style.display = 'flex';
        if (state.rsvpStatus === 'yes') {
          rsvpBanner.className = 'rsvp-status-banner status-yes';
          const iconEl = rsvpBanner.querySelector('.status-icon');
          if (iconEl) iconEl.textContent = '💐';
          rsvpStatusText.textContent = `Tuyệt vời! ${state.guestName || 'Bạn'} đã xác nhận SẼ ĐẾN dự Lễ Tốt Nghiệp cùng Đạt!`;
          rsvpStatusSub.textContent = 'Đạt rất háo hức và mong chờ được gặp, chụp hình kỷ niệm cùng bạn tại HUBT!';
        } else {
          rsvpBanner.className = 'rsvp-status-banner status-no';
          const iconEl = rsvpBanner.querySelector('.status-icon');
          if (iconEl) iconEl.textContent = '💌';
          rsvpStatusText.textContent = `Đạt đã nhận được lời chúc của ${state.guestName || 'Bạn'}!`;
          rsvpStatusSub.textContent = 'Cảm ơn bạn rất nhiều vì luôn theo dõi và ủng hộ hành trình của Đạt từ xa!';
        }
      }

      if (mascotBubble) {
        mascotBubble.textContent = `Cảm ơn ${state.guestName || 'Bạn'} rất nhiều! Xem bản đồ và gọi cho Đạt nha! 📱`;
      }
    }, 180);
  }

  if (btnRsvpYes) {
    btnRsvpYes.addEventListener('click', () => {
      handleRsvpDecision('yes');
    });
  }

  if (btnRsvpNo) {
    btnRsvpNo.addEventListener('click', () => {
      handleRsvpDecision('no');
    });
  }

  // =========================================================================
  // 11. SCREEN 4: COUNTDOWN & NAVIGATION
  // =========================================================================
  const targetDate = new Date('2026-10-16T09:30:00+07:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysVal) daysVal.textContent = '00';
      if (hoursVal) hoursVal.textContent = '00';
      if (minsVal) minsVal.textContent = '00';
      if (secsVal) secsVal.textContent = '00';
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysVal) daysVal.textContent = d < 10 ? '0' + d : d;
    if (hoursVal) hoursVal.textContent = h < 10 ? '0' + h : h;
    if (minsVal) minsVal.textContent = m < 10 ? '0' + m : m;
    if (secsVal) secsVal.textContent = s < 10 ? '0' + s : s;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  const navPills = document.querySelectorAll('.invitation-nav-bar .nav-pill');
  if (navPills && navPills.length > 0) {
    navPills.forEach(pill => {
      pill.addEventListener('click', () => {
        navPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  }

  // =========================================================================
  // 12. CONFETTI DOODLE ANIMATION
  // =========================================================================
  function fireConfettiDoodle() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    if (!ctx) return;

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#e06d53', '#e5a93c', '#1b2a47', '#34c759', '#5ac8fa', '#ff2d55'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frames = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          aliveCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      frames++;
      if (aliveCount > 0 && frames < 120) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    renderConfetti();
  }

  // =========================================================================
  // 13. GỢI Ý NHẮC NHỞ SAU 7 GIÂY (TỰ ĐỘNG BIẾN MẤT KHI CHẠM THƯ)
  // =========================================================================
  let idleHintTimer = null;

  function startIdleHintTimer() {
    if (idleHintTimer) clearTimeout(idleHintTimer);
    if (idleHintMessage) {
      idleHintMessage.style.display = '';
      idleHintMessage.style.opacity = '';
    }
    idleHintTimer = setTimeout(() => {
      if (idleHintMessage && !state.isLetterOpened) {
        idleHintMessage.classList.add('visible');
      }
    }, 4000);
  }

  function dismissIdleHint() {
    if (idleHintTimer) {
      clearTimeout(idleHintTimer);
      idleHintTimer = null;
    }
    if (idleHintMessage) {
      idleHintMessage.classList.remove('visible');
      idleHintMessage.style.opacity = '0';
      setTimeout(() => {
        idleHintMessage.style.display = 'none';
      }, 550);
    }
  }

  // =========================================================================
  // 14. BỘ ĐIỀU KHIỂN GIÓ THU GHIBLI SỐNG ĐỘNG
  // =========================================================================
  let windGustTimer = null;

  function triggerWindGust() {
    if (!screenLetter) return;
    if (state.isLetterOpened || !screenLetter.classList.contains('active')) {
      return;
    }

    screenLetter.classList.add('wind-gust-active');
    setTimeout(() => {
      if (screenLetter) {
        screenLetter.classList.remove('wind-gust-active');
      }
    }, 2600);
  }

  function scheduleNextWindGust() {
    if (windGustTimer) clearTimeout(windGustTimer);
    const nextInterval = 8000 + Math.floor(Math.random() * 3000);
    windGustTimer = setTimeout(() => {
      triggerWindGust();
      scheduleNextWindGust();
    }, nextInterval);
  }

  function stopWindGusts() {
    if (windGustTimer) {
      clearTimeout(windGustTimer);
      windGustTimer = null;
    }
    if (screenLetter) {
      screenLetter.classList.remove('wind-gust-active');
    }
  }

  // =========================================================================
  // 15. NHẠC NỀN CHILL VÀ MASCOT WIDGET
  // =========================================================================
  let isChillTunePlaying = false;

  function toggleMusic() {
    initAudioCtx();
    isChillTunePlaying = !isChillTunePlaying;
    if (musicToggleBtn) {
      if (isChillTunePlaying) {
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.classList.remove('is-muted');
        musicToggleBtn.setAttribute('title', 'Tắt nhạc nền');
        if (mascotBubble) mascotBubble.textContent = 'Bật nhạc chill thanh xuân rùi nè! 🎶';
      } else {
        musicToggleBtn.classList.remove('playing');
        musicToggleBtn.classList.add('is-muted');
        musicToggleBtn.setAttribute('title', 'Bật nhạc chill');
        if (mascotBubble) mascotBubble.textContent = 'Đã tạm tắt nhạc nhé! 🤫';
      }
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  if (mascotWidget && mascotBubble) {
    const hints = [
      'Gặp Đạt ở HUBT vào ngày 16/10 nha! 🎓',
      'Đạt có số 0379 346 540, cần gì cứ gọi ngay nhé! 📞',
      'Đạt chuẩn bị sẵn nhiều hoa và quà lắm rùi nè! 💐',
      'Nhớ sạc đầy 100% pin điện thoại để chụp ảnh nha! 📸'
    ];
    mascotWidget.addEventListener('click', () => {
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      mascotBubble.textContent = randomHint;
      fireConfettiDoodle();
    });
  }

  // Khởi động gió nhẹ và gợi ý nhàn rỗi sau khi vào trang
  setTimeout(() => {
    triggerWindGust();
    scheduleNextWindGust();
  }, 2500);

  startIdleHintTimer();

  // Khởi tạo tên động ban đầu
  updateDynamicNames('');

  // =========================================================================
  // CHẾ ĐỘ KHÁM PHÁ BÀN HỌC GHIBLI (DESK EXPLORER MODE - VIỆC 1)
  // =========================================================================
  window.activateDeskExplorerMode = activateDeskExplorerMode;
  window.activateDeskExplorerMode = activateDeskExplorerMode;

  function activateDeskExplorerMode(status) {
    if (typeof idleHintTimer !== 'undefined' && idleHintTimer) {
      clearTimeout(idleHintTimer);
      idleHintTimer = null;
    }
    const idleMsg = document.getElementById('idle-hint-message');
    if (idleMsg) {
      idleMsg.classList.remove('visible');
      idleMsg.style.display = 'none';
      idleMsg.style.opacity = '0';
      idleMsg.style.visibility = 'hidden';
    }
    const lobbyStage = document.getElementById('lobby-desk-stage');
    if (lobbyStage) {
      lobbyStage.classList.add('desk-explorer-active');
      lobbyStage.setAttribute('data-mode', 'explorer');
    }
    console.log('Activating Desk Explorer Mode with status:', status);
    
    // 1. Chuyển màn hình về Bàn học Ghibli & dọn sạch lớp phủ cinema / zoom
    document.body.classList.remove('cinema-screen-active', 'cinema-fullscreen-mode');
    if (screenLetter) {
      screenLetter.classList.remove('screen-letter-zoomed', 'cinematic-focus');
      screenLetter.classList.add('active');
    }
    if (screenCinema) {
      screenCinema.classList.remove('active');
    }
    if (screenMain) {
      screenMain.classList.remove('active');
    }
    if (video && !video.paused) {
      video.pause();
    }
    const skipBtn = document.getElementById('btn-skip-cinema');
    if (skipBtn) skipBtn.style.display = 'none';
    const backCtrl = document.getElementById('back-control-container');
    if (backCtrl) backCtrl.classList.remove('visible');

    // 2. Đảm bảo khung viết thư to và phong bì trifold ẩn đi
    const landscapeContainer = document.getElementById('landscape-desk-container');
    if (landscapeContainer) landscapeContainer.style.display = 'none';

    const trifoldStage = document.getElementById('trifold-envelope-stage');
    if (trifoldStage) trifoldStage.style.display = 'none';

    const spotlight = document.getElementById('cinematic-spotlight');
    if (spotlight) spotlight.style.opacity = '0';

    // 3. Hiện sảnh bàn học và kích hoạt chế độ Khám Phá (bắt buộc display = block)
    const lobbyDesk = document.getElementById('lobby-desk-stage');
    if (lobbyDesk) {
      lobbyDesk.classList.remove('hidden-stage');
      lobbyDesk.classList.add('desk-explorer-active');
      lobbyDesk.style.display = 'block';
      lobbyDesk.style.opacity = '1';
      lobbyDesk.style.pointerEvents = 'auto';
    }

    // 4. Ẩn dòng chữ gợi ý mở thư lần 1, ẩn hotspot lá thư cũ
    const idleHint = document.getElementById('idle-hint-message');
    if (idleHint) idleHint.style.display = 'none';

    const oldLetterHotspot = document.getElementById('waiting-desk-letter-hotspot');
    if (oldLetterHotspot) oldLetterHotspot.style.display = 'none';

    // 5. Bật lớp SVG tương tác bo viền sát từng vật thể
    const svgLayer = document.getElementById('desk-interactive-svg-layer');
    if (svgLayer) svgLayer.style.display = 'block';

    const oldDivHotspots = document.getElementById('desk-explorer-hotspots');
    if (oldDivHotspots) oldDivHotspots.style.display = 'none';

    // 6. Ẩn hẳn banner thông báo cũ để nhường chỗ hoàn toàn cho Dòng chữ lời chúc chạy ngang (theo yêu cầu User)
    const explorerBanner = document.getElementById('desk-explorer-banner');
    if (explorerBanner) {
      explorerBanner.style.display = 'none';
    }

    // 7. Bật nút điều khiển nhạc
    const audioContainer = document.getElementById('audio-control-container');
    if (audioContainer) audioContainer.style.display = 'flex';

    // 8. Bật thanh Dock khám phá nhanh trên điện thoại (Mobile Quick Explorer Dock)
    const mobileDock = document.getElementById('mobile-quick-dock');
    if (mobileDock) {
      mobileDock.style.display = 'flex';
      mobileDock.style.opacity = '1';
    }

    // 9. Đánh dấu trạng thái Bàn học khám phá và kiểm tra nhắc xoay ngang màn hình
    state.isDeskExplorerActive = true;
    if (typeof checkAndPromptLandscape === 'function') {
      checkAndPromptLandscape();
    }

    // 10. Kích hoạt hiển thị thanh lời chúc chạy ngang của mọi người ở Màn Kết (Sau khi xem xong Vlog)
    document.body.classList.add('desk-explorer-mode-active');
    const marqueeBar = document.getElementById('wishes-marquee-bar');
    if (marqueeBar) {
      marqueeBar.classList.add('visible');
      marqueeBar.style.removeProperty('display');
      marqueeBar.style.removeProperty('opacity');
      marqueeBar.style.removeProperty('visibility');
      marqueeBar.style.removeProperty('pointer-events');
    }

    // Gợi ý hướng dẫn chặng cuối xuất hiện sau nhịp 4 giây dưới khu vực chúc
    const deskHintMsg = document.getElementById('desk-explorer-hint-msg');
    if (deskHintMsg && !state.hasInteractedDeskItem) {
      setTimeout(() => {
        if (state.isDeskExplorerActive && !state.hasInteractedDeskItem) {
          deskHintMsg.classList.add('visible');
        }
      }, 4000);
    }

  }

  // Gắn sự kiện nút lối tắt chuyển nhanh sang chế độ khám phá bàn học nếu có
  const btnQuickDesk = document.getElementById('btn-quick-desk-explorer');
  if (btnQuickDesk) {
    btnQuickDesk.addEventListener('click', () => {
      playOpenChime();
      activateDeskExplorerMode(state.rsvpStatus || 'yes');
    });
  }

  // Đảm bảo dọn sạch cờ cũ để luôn bắt đầu từ Bước 1
  localStorage.removeItem('hubt_desk_explorer_active');

  // Dọn sạch query string nếu còn sót từ các lượt test trước
  if (window.location.search.includes('desk') || window.location.hash.includes('desk')) {
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
  }


  // =========================================================================
  // KHỞI TẠO TƯƠNG TÁC CHO 5 VẬT PHẨM TRÊN BÀN HỌC GHIBLI (DESK EXPLORER)
  // =========================================================================
  let openDeskDetailModal, closeDeskDetailModal;

  function initDeskExplorerInteractions() {
    const modalDetail = document.getElementById('modal-desk-detail');
    const modalIcon = document.getElementById('desk-modal-icon');
    const modalTitle = document.getElementById('desk-modal-title');
    const modalSubtitle = document.getElementById('desk-modal-subtitle');
    const modalBody = document.getElementById('desk-modal-body');
    const btnCloseModal = document.getElementById('btn-close-desk-modal');
    const btnBackDesk = document.getElementById('btn-modal-back-desk');
    const btnViewFull = document.getElementById('btn-modal-view-full');
    const navReturnDesk = document.getElementById('nav-btn-return-desk');

    const hotspotMap = document.getElementById('hotspot-map');
    const hotspotBadge = document.getElementById('hotspot-badge');
    const hotspotLetter = document.getElementById('hotspot-letter');
    const hotspotClock = document.getElementById('hotspot-clock');
    const hotspotNotebook = document.getElementById('hotspot-notebook');

    closeDeskDetailModal = function() {
      if (modalDetail) {
        modalDetail.classList.remove('active');
        modalDetail.setAttribute('aria-hidden', 'true');
        modalDetail.style.display = 'none';
      }
      document.body.classList.remove('modal-open');
    }

    openDeskDetailModal = function(itemKey) {
      if (!modalDetail || !modalBody) return;
      playOpenChime();

      const guestName = state.guestName || 'Bạn';

      if (itemKey === 'map') {
        if (modalIcon) modalIcon.textContent = '🗺️';
        if (modalTitle) modalTitle.textContent = 'Địa Chỉ & Chỉ Đường HUBT';
        if (modalSubtitle) modalSubtitle.textContent = 'Trường Đại Học Kinh Doanh và Công Nghệ Hà Nội';
        modalBody.innerHTML = `
          <div class="desk-detail-content-wrap detail-map-card">
            <div class="map-address-banner">
              <span class="map-pin-icon">📍</span>
              <div class="map-address-text">
                <strong>Đại Học Kinh Doanh & Công Nghệ Hà Nội (HUBT)</strong>
                <p>Số 29A, Ngõ 124 Phố Vĩnh Tuy, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Hà Nội</p>
              </div>
            </div>
            <div class="map-iframe-container">
              <iframe
                title="Bản đồ Google Maps HUBT Vĩnh Tuy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.846571589255!2d105.87532347604975!3d20.998786489808364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ae97be07f2df%3A0x6b2bf7c442cf38a!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBLaW5oIERvYW5oIHbDoCBDw7RuZyBOZ2jhu4cgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1711200000000!5m2!1svi!2s"
                loading="lazy"
                allowfullscreen=""
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+H%E1%BB%8Dc+Kinh+Doanh+v%C3%A0+C%C3%B4ng+Ngh%E1%BB%87+H%C3%A0+N%E1%BB%99i+29A+V%C4%A9nh+Tuy" target="_blank" rel="noopener noreferrer" class="btn-open-google-maps">
              <span>🚗 Mở Ứng Dụng Google Maps Chỉ Đường</span>
            </a>
          </div>
        `;
      } else if (itemKey === 'badge') {
        if (modalIcon) modalIcon.textContent = '🪪';
        if (modalTitle) modalTitle.textContent = 'Thông Tin Liên Hệ';
        if (modalSubtitle) modalSubtitle.textContent = 'Tân Kỹ Sư Nguyễn Thế Đạt • CNTT K27';
        modalBody.innerHTML = `
          <div class="desk-detail-content-wrap detail-contact-card">
            <div class="contact-avatar-wrap">
              <img src="./assets/images/dat_portrait_7518.jpg?v=7518" alt="Nguyễn Thế Đạt" class="contact-avatar-img" onerror="this.src='./assets/images/year_4.jpg'">
            </div>
            <h3 class="contact-person-name">Nguyễn Thế Đạt</h3>
            <p class="contact-person-role">Tân Kỹ Sư CNTT • HUBT Khóa 27</p>

            <div class="contact-hotline-highlight">
              <span class="contact-hotline-label">Hotline Trực Tiếp</span>
              <a href="tel:0379346540" class="contact-hotline-number">0379 346 540</a>
            </div>

            <div class="contact-action-buttons">
              <a href="tel:0379346540" class="btn-contact-action action-call">
                <span>📞 Gọi Ngay</span>
              </a>
              <button id="btn-copy-phone" type="button" class="btn-contact-action action-copy">
                <span>📋 Sao Chép Số</span>
              </button>
            </div>

            <div class="contact-social-links">
              <a href="https://zalo.me/0379346540" target="_blank" rel="noopener noreferrer" class="btn-social-pill social-zalo">
                <span>💬 Nhắn Zalo</span>
              </a>
              <a href="https://www.facebook.com/datintrustforlove" target="_blank" rel="noopener noreferrer" class="btn-social-pill social-fb">
                <span>🌐 Facebook</span>
              </a>
            </div>

            <p class="contact-welcome-note">
              "Khi ${guestName} đến cổng trường HUBT, chỉ cần nhấc máy bấm gọi là Đạt sẽ chạy ra đón và chụp hình kỷ niệm cùng cậu ngay nhé! ✨"
            </p>
          </div>
        `;

        const copyBtn = modalBody.querySelector('#btn-copy-phone');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('0379346540').then(() => {
              copyBtn.innerHTML = '<span>✅ Đã Sao Chép!</span>';
              setTimeout(() => {
                copyBtn.innerHTML = '<span>📋 Sao Chép Số</span>';
              }, 2000);
            }).catch(() => {
              alert('Số điện thoại: 0379 346 540');
            });
          });
        }
      } else if (itemKey === 'clock') {
        if (modalIcon) modalIcon.textContent = '⏰';
        if (modalTitle) modalTitle.textContent = 'Thời Gian & Lịch Trình Buổi Lễ';
        if (modalSubtitle) modalSubtitle.textContent = 'Lễ Tốt Nghiệp Đại Học K27 • HUBT 2026';
        modalBody.innerHTML = `
          <div class="desk-detail-content-wrap detail-clock-card">
            <div class="clock-ceremony-date">
              📅 09:30 Sáng • Thứ Sáu, Ngày 16/10/2026
            </div>

            <div class="clock-countdown-grid">
              <div class="clock-count-box">
                <span class="clock-count-val" id="desk-count-days">--</span>
                <span class="clock-count-label">Ngày</span>
              </div>
              <div class="clock-count-box">
                <span class="clock-count-val" id="desk-count-hours">--</span>
                <span class="clock-count-label">Giờ</span>
              </div>
              <div class="clock-count-box">
                <span class="clock-count-val" id="desk-count-mins">--</span>
                <span class="clock-count-label">Phút</span>
              </div>
              <div class="clock-count-box">
                <span class="clock-count-val" id="desk-count-secs">--</span>
                <span class="clock-count-label">Giây</span>
              </div>
            </div>

            <div class="clock-timeline-list">
              <div class="clock-timeline-step">
                <span class="step-time-tag">09:00</span>
                <p class="step-desc">Đón tiếp bạn bè, người thân & chụp ảnh check-in tại khuôn viên HUBT</p>
              </div>
              <div class="clock-timeline-step">
                <span class="step-time-tag" style="background:#b45309;color:#fff;">09:30</span>
                <p class="step-desc">Lễ trao bằng tốt nghiệp kỹ sư chính thức tại Hội trường lớn</p>
              </div>
              <div class="clock-timeline-step">
                <span class="step-time-tag">10:30</span>
                <p class="step-desc">Tung mũ cử nhân, chụp ảnh kỷ niệm cùng gia đình & thầy cô</p>
              </div>
              <div class="clock-timeline-step">
                <span class="step-time-tag">11:30</span>
                <p class="step-desc">Bữa tiệc liên hoan chúc mừng tân kỹ sư thân mật</p>
              </div>
            </div>
          </div>
        `;

        function updateModalCountdown() {
          const target = new Date('2026-10-16T09:30:00+07:00').getTime();
          const now = Date.now();
          const diff = target - now;
          if (diff <= 0) return;
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          const elD = document.getElementById('desk-count-days');
          const elH = document.getElementById('desk-count-hours');
          const elM = document.getElementById('desk-count-mins');
          const elS = document.getElementById('desk-count-secs');
          if (elD) elD.textContent = String(d).padStart(2, '0');
          if (elH) elH.textContent = String(h).padStart(2, '0');
          if (elM) elM.textContent = String(m).padStart(2, '0');
          if (elS) elS.textContent = String(s).padStart(2, '0');
        }
        updateModalCountdown();
        const countdownTimerId = setInterval(updateModalCountdown, 1000);
        // Clear interval when modal closes
        const origClose = closeDeskDetailModal;
        closeDeskDetailModal = function() {
          clearInterval(countdownTimerId);
          origClose();
        };
            } else if (itemKey === 'notebook') {
        if (modalIcon) modalIcon.textContent = '📖';
        if (modalTitle) modalTitle.textContent = 'Bảng Điểm & Hành Trình 4 Năm';
        if (modalSubtitle) modalSubtitle.textContent = 'Nguyễn Thế Đạt • MSV: 2722225705 • HUBT (K27)';

        const subjectsList = [
          // Năm 1 (2022 - 2023)
          { y: '2022 - 2023', s: 'Học kỳ 1', name: 'Đồ họa máy tính', r: 'B', sc: '7,6' },
          { y: '2022 - 2023', s: 'Học kỳ 1', name: 'Lập trình cấu trúc', r: 'C+', sc: '6,6' },
          { y: '2022 - 2023', s: 'Học kỳ 1', name: 'Tin học đại cương', r: 'B', sc: '7,0' },
          { y: '2022 - 2023', s: 'Học kỳ 1', name: 'Giáo dục quốc phòng - an ninh', r: 'C', sc: '6,0' },
          { y: '2022 - 2023', s: 'Học kỳ 1', name: 'Tư tưởng Hồ Chí Minh', r: 'C', sc: '6,1' },
          { y: '2022 - 2023', s: 'Học kỳ 1', name: 'Lịch sử Đảng Cộng sản VN', r: 'C', sc: '6,0' },

          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Bảng tính Excel & CSDL', r: 'B', sc: '7,2' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Toán rời rạc', r: 'B', sc: '7,0' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Đồ án phần mềm C++', r: 'B', sc: '7,0' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Tiếng Anh HA1', r: 'B', sc: '7,0' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Lập trình C++ cơ sở', r: 'D+', sc: '5,4' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Lập trình trực quan', r: 'C+', sc: '6,6' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Quản trị cơ sở dữ liệu', r: 'C+', sc: '6,8' },
          { y: '2022 - 2023', s: 'Học kỳ 2', name: 'Đồ án Quản trị CSDL', r: 'C+', sc: '6,9' },

          // Năm 2 (2023 - 2024)
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Cấu trúc dữ liệu & Giải thuật', r: 'D+', sc: '5,3' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Kiến trúc máy tính', r: 'D+', sc: '5,2' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Lập trình Java cơ sở', r: 'C', sc: '5,7' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Lập trình hướng đối tượng', r: 'C', sc: '6,0' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Điện toán di động', r: 'C+', sc: '6,4' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Đồ án phần mềm Java', r: 'C+', sc: '6,8' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Thiết kế CSDL trong Access', r: 'C+', sc: '6,8' },
          { y: '2023 - 2024', s: 'Học kỳ 1', name: 'Tiếng Anh HA2', r: 'B', sc: '7,1' },

          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Kịch bản ASP / JS / PHP', r: 'B+', sc: '8,1' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Cơ sở dữ liệu quan hệ', r: 'B+', sc: '7,9' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Kinh tế chính trị Mác - Lênin', r: 'B', sc: '7,4' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Phân tích thiết kế HTTT', r: 'B', sc: '7,1' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Pháp luật đại cương', r: 'C+', sc: '6,8' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Chủ nghĩa xã hội khoa học', r: 'C+', sc: '6,7' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Thiết kế hướng đối tượng', r: 'C+', sc: '6,6' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Đồ án Điện toán đám mây', r: 'C+', sc: '6,8' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Đồ án Ứng dụng di động', r: 'C+', sc: '6,5' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Đồ án Thực tế ảo (VR)', r: 'C+', sc: '6,4' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Kỹ thuật thiết kế khóa', r: 'C', sc: '5,7' },
          { y: '2023 - 2024', s: 'Học kỳ 2', name: 'Tiếng Anh HA3', r: 'C+', sc: '6,6' },

          // Năm 3 (2024 - 2025)
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Các công nghệ nền 4.0', r: 'B+', sc: '8,0' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Thực tế ảo (VR)', r: 'B+', sc: '7,9' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Lập trình Python', r: 'B', sc: '7,6' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Mạng máy tính', r: 'B', sc: '7,2' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Project Web & Network', r: 'B', sc: '7,2' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Bảo mật thông tin', r: 'B', sc: '7,0' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Tương tác người máy (HMI)', r: 'C+', sc: '6,9' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Đồ án Môi trường ảo', r: 'C+', sc: '6,8' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Đồ án phần mềm Web', r: 'C', sc: '6,1' },
          { y: '2024 - 2025', s: 'Học kỳ 1', name: 'Cơ sở dữ liệu phân tán', r: 'C', sc: '6,0' },

          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Xử lý dữ liệu lớn (Big Data)', r: 'A', sc: '9,2' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Hệ điều hành Unix', r: 'A', sc: '9,0' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Internet vạn vật (IoT)', r: 'A', sc: '8,6' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Hệ hỗ trợ quyết định (DSS)', r: 'A', sc: '8,5' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Quản trị mạng', r: 'B+', sc: '8,2' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Lập trình phân tán', r: 'B+', sc: '7,9' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Kỹ nghệ phần mềm', r: 'B', sc: '7,6' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Trí tuệ nhân tạo (AI)', r: 'B', sc: '7,6' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Đồ án Blockchain', r: 'B', sc: '7,0' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Đồ án Công nghệ 4.0', r: 'B', sc: '7,0' },
          { y: '2024 - 2025', s: 'Học kỳ 2', name: 'Giáo dục thể chất 1', r: 'C+', sc: '6,4' },

          // Năm 4 (2025 - 2026 & Tốt nghiệp)
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Hệ thống Kế toán máy', r: 'A', sc: '9,1' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Hệ thống Ngân hàng máy', r: 'A', sc: '8,6' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Nhận dạng sinh học', r: 'A', sc: '9,0' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Thương mại điện tử', r: 'B', sc: '7,3' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Công nghệ Java nhúng', r: 'B+', sc: '8,4' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Giáo dục thể chất 3', r: 'B', sc: '7,5' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Lập trình nâng cao', r: 'B+', sc: '7,9' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Quản trị CSDL nâng cao', r: 'A', sc: '8,7' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Phần mềm Mã nguồn mở', r: 'B+', sc: '7,8' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Quản trị dự án CNTT', r: 'A', sc: '8,7' },
          { y: '2025 - 2026', s: 'Học kỳ 1', name: 'Triết học Mác - Lênin', r: 'B+', sc: '8,1' },

          { y: '2025 - 2026', s: 'Tốt nghiệp', name: 'Thực tập & Đồ án tốt nghiệp', r: 'A', sc: '9,5' }
        ];

        function getRankClass(rank) {
          if (rank === 'A') return 'rank-a';
          if (rank === 'B+' || rank === 'B') return 'rank-b';
          if (rank === 'C+' || rank === 'C') return 'rank-c';
          return 'rank-d-plus';
        }

        function renderSubjectsHtml(filterYear) {
          const filtered = filterYear === 'all' 
            ? subjectsList 
            : subjectsList.filter(item => item.y.includes(filterYear));

          // Nhóm theo năm và học kỳ
          const groups = {};
          filtered.forEach(sub => {
            const key = `${sub.y} • ${sub.s}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(sub);
          });

          let html = '';
          for (const [groupTitle, list] of Object.entries(groups)) {
            html += `
              <div class="transcript-semester-group">
                <span class="semester-group-title">📅 ${groupTitle}</span>
                <div class="grades-table-wrap">
                  ${list.map(item => `
                    <div class="grade-row-item">
                      <span class="grade-subj-name">${item.name}</span>
                      <div class="grade-scores-wrap">
                        <span class="grade-rank-badge ${getRankClass(item.r)}">${item.r}</span>
                        <span class="grade-score-num">${item.sc}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }
          return html;
        }

        modalBody.innerHTML = `
          <div class="desk-detail-content-wrap transcript-modal-container">
            <div class="transcript-quick-stats">
              <div class="stat-chip">
                <span class="stat-chip-num msv-num">2722225705</span>
                <span class="stat-chip-lbl">Mã Sinh Viên</span>
              </div>
              <div class="stat-chip">
                <span class="stat-chip-num">7,25</span>
                <span class="stat-chip-lbl">GPA 10</span>
              </div>
              <div class="stat-chip">
                <span class="stat-chip-num">9,5</span>
                <span class="stat-chip-lbl">Đồ Án A</span>
              </div>
              <div class="stat-chip">
                <span class="stat-chip-num">0</span>
                <span class="stat-chip-lbl">Học Lại</span>
              </div>
            </div>

            <div class="transcript-year-tabs">
              <button type="button" class="btn-year-tab active" data-year="all">Tất Cả (61)</button>
              <button type="button" class="btn-year-tab" data-year="2022">Năm 1</button>
              <button type="button" class="btn-year-tab" data-year="2023">Năm 2</button>
              <button type="button" class="btn-year-tab" data-year="2024">Năm 3</button>
              <button type="button" class="btn-year-tab" data-year="2025">Năm 4 & TN</button>
            </div>

            <div id="transcript-list-body" class="transcript-list-body">
              ${renderSubjectsHtml('all')}
            </div>
          </div>
        `;

        // Gắn sự kiện chuyển tab
        const tabBtns = modalBody.querySelectorAll('.btn-year-tab');
        const listBody = modalBody.querySelector('#transcript-list-body');
        tabBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const yearKey = btn.getAttribute('data-year');
            if (listBody) {
              listBody.innerHTML = renderSubjectsHtml(yearKey);
            }
          });
        });
      } else if (itemKey === 'letter') {
        if (modalIcon) modalIcon.textContent = '🎬';
        if (modalTitle) modalTitle.textContent = 'Vlog Kỷ Niệm Thanh Xuân';
        if (modalSubtitle) modalSubtitle.textContent = 'Hành trình 4 năm của Đạt tại HUBT (2022 - 2026)';
        modalBody.innerHTML = `
          <div class="desk-detail-content-wrap detail-letter-card">
            <div class="letter-choice-banner" style="text-align: center; padding: 14px 6px;">
              <p style="font-size: 1.02rem; color: #4a3828; margin-bottom: 20px; line-height: 1.6;">
                Cậu muốn thưởng thức lại video Vlog ghi dấu hành trình 4 năm thanh xuân của Đạt chứ? ✨
              </p>
              <div class="letter-action-grid" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; margin: 0 auto;">
                <button id="btn-modal-replay-vlog" class="btn-letter-action action-replay-vlog" type="button" style="width: 100%; max-width: 300px; margin: 0 auto; display: inline-flex; align-items: center; justify-content: center; padding: 13px 24px; font-size: 1rem; font-weight: 700; border-radius: 26px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.35);">
                  <span>🎬 Xem Lại Video Vlog</span>
                </button>
              </div>
            </div>
          </div>
        `;

        const btnReplay = modalBody.querySelector('#btn-modal-replay-vlog');
        if (btnReplay) {
          btnReplay.addEventListener('click', () => {
            closeDeskDetailModal();
            const explorerBanner = document.getElementById('desk-explorer-banner');
            if (explorerBanner) explorerBanner.style.display = 'none';
            const svgLayer = document.getElementById('desk-interactive-svg-layer');
            if (svgLayer) svgLayer.style.display = 'none';
            const packingHintEl = document.getElementById('packing-hint-text');
            if (packingHintEl) {
              packingHintEl.textContent = '';
              packingHintEl.style.display = 'none';
            }
            switchScreen(screenLetter, screenCinema);
            if (btnSkipCinema) btnSkipCinema.style.display = 'inline-flex';
            startCinemaPlayback();
          });
        }
      }
      modalDetail.classList.add('active');
      modalDetail.setAttribute('aria-hidden', 'false');
      modalDetail.style.display = 'flex';
      document.body.classList.add('modal-open');
    }

    // Gắn sự kiện click và phím Enter/Space cho cả 5 vật thể
    const hotspots = [
      { el: hotspotMap, key: 'map' },
      { el: hotspotBadge, key: 'badge' },
      { el: hotspotLetter, key: 'letter' },
      { el: hotspotClock, key: 'clock' },
      { el: hotspotNotebook, key: 'notebook' }
    ];

    hotspots.forEach(({ el, key }) => {
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          openDeskDetailModal(key);
        });
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDeskDetailModal(key);
          }
        });
      }
    });

    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', closeDeskDetailModal);
    }
    if (btnBackDesk) {
      btnBackDesk.addEventListener('click', closeDeskDetailModal);
    }
    if (btnViewFull) {
      btnViewFull.addEventListener('click', () => {
        closeDeskDetailModal();
        switchScreen(screenLetter, screenMain);
      });
    }

    if (navReturnDesk) {
      navReturnDesk.addEventListener('click', () => {
        activateDeskExplorerMode(state.rsvpStatus || 'yes');
      });
    }

    if (modalDetail) {
      modalDetail.addEventListener('click', (e) => {
        if (e.target === modalDetail) {
          closeDeskDetailModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalDetail && modalDetail.classList.contains('active')) {
        closeDeskDetailModal();
      }
    });
  }



  // =========================================================================
  // 14. TỰ ĐỘNG ĐIỀU CHỈNH THEO THIẾT BỊ (AUTO RESPONSIVE NATIVE)
  // Điện thoại tự động scale theo điện thoại, Máy tính tự động theo máy tính
  // =========================================================================
  function updateLayoutByDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || (window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    
    if (isMobile) {
      document.body.classList.remove('mode-desktop-fullscreen', 'mode-phone-frame');
      document.body.classList.add('device-mobile');
    } else {
      // Trên máy tính / Laptop: Tự động bung toàn màn hình máy tính desktop
      document.body.classList.remove('mode-phone-frame', 'phone-portrait', 'device-mobile');
      document.body.classList.add('mode-desktop-fullscreen', 'device-desktop');
    }
    checkAndPromptLandscape();
  }

  window.addEventListener('resize', updateLayoutByDevice);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateLayoutByDevice, 200);
  });
  updateLayoutByDevice();

  // =========================================================================
  // 15. GẮN SỰ KIỆN CLICK CHO THANH DOCK KHÁM PHÁ NHANH TRÊN ĐIỆN THOẠI
  // =========================================================================
  function initMobileQuickDock() {
    const dockButtons = document.querySelectorAll('.dock-item-btn');
    dockButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = btn.getAttribute('data-target');
        if (target) {
          playOpenChime();
          dockButtons.forEach(b => b.classList.remove('dock-btn-selected'));
          btn.classList.add('dock-btn-selected');
          openDeskDetailModal(target);
        }
      });
    });
  }

  // =========================================================================
  // 16. XỬ LÝ NHẮC XOAY NGANG MÀN HÌNH (LANDSCAPE ROTATE PROMPT TOÀN TRANG)
  // =========================================================================
  function checkAndPromptLandscape() {
    const promptEl = document.getElementById('landscape-rotate-prompt');
    if (!promptEl) return;

    if (state.hasDismissedRotatePrompt) {
      promptEl.style.display = 'none';
      document.body.classList.add('rotate-prompt-dismissed');
      return;
    }

    // Kiểm tra xem thiết bị hiện tại có đang ở hướng ngang hay không
    const isLandscape = window.innerWidth > window.innerHeight;
    const isDesktopFullscreen = document.body.classList.contains('mode-desktop-fullscreen') && window.innerWidth > 768;
    const isPhoneLandscape = document.body.classList.contains('phone-landscape');

    if (isLandscape || isDesktopFullscreen || isPhoneLandscape) {
      promptEl.style.display = 'none';
      document.body.classList.remove('rotate-prompt-dismissed');
    } else {
      // Chưa xoay ngang -> Hiển thị thông báo yêu cầu xoay ngang
      promptEl.style.display = 'flex';
      document.body.classList.remove('rotate-prompt-dismissed');
    }
  }

  const btnDismissRotate = document.getElementById('btn-dismiss-rotate-prompt');
  if (btnDismissRotate) {
    btnDismissRotate.addEventListener('click', (e) => {
      e.preventDefault();
      state.hasDismissedRotatePrompt = true;
      document.body.classList.add('rotate-prompt-dismissed');
      const promptEl = document.getElementById('landscape-rotate-prompt');
      if (promptEl) promptEl.style.display = 'none';
    });
  }

  window.addEventListener('resize', checkAndPromptLandscape);
  window.addEventListener('orientationchange', () => {
    setTimeout(checkAndPromptLandscape, 250);
  });

    initDeskExplorerInteractions();

  initMobileQuickDock();

  // Expose các API cho việc test và điều khiển tương tác
  
  // =========================================================================
  // 12. QUẢN LÝ DATABASE VÀ THANH CHẠY LỜI CHÚC (WISHES MARQUEE & DATABASE)
  // =========================================================================
  const WishesDB = {
    wishes: [],

    formatTime(isoString) {
      if (!isoString) return 'Vừa xong';
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return 'Gần đây';
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${h}:${m} • ${day}/${month}/${year}`;
      } catch (e) {
        return 'Gần đây';
      }
    },

    async init() {
      await this.loadWishes();
      this.renderMarquee();
      this.renderModal();
      this.bindEvents();
    },

    async loadWishes() {
      // 1. Ưu tiên gọi API server nếu đang chạy range_server.py
      try {
        const res = await fetch('/api/wishes');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            this.wishes = data;
            return;
          }
        }
      } catch (e) {
        // Fallback khi chạy tĩnh trên public host
      }

      // 2. Fallback đọc file tĩnh wishes.json
      try {
        const res = await fetch('./wishes.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            this.wishes = data;
          }
        }
      } catch (e) {
        console.log('Cannot fetch ./wishes.json');
      }

      // 3. Tích hợp các lời chúc đã lưu trong localStorage của người dùng
      try {
        const local = JSON.parse(localStorage.getItem('hubt_user_wishes') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          const existingIds = new Set(this.wishes.map(w => w.id));
          for (const item of local) {
            if (!existingIds.has(item.id)) {
              this.wishes.unshift(item);
            }
          }
        }
      } catch (e) {}

      // 4. Khi chưa có lời chúc nào: Giữ rỗng để chờ lời chúc thật của khách mời khi public
      if (!this.wishes) {
        this.wishes = [];
      }
    },

    async addWish(name, wish, status = 'yes') {
      const cleanName = (name || '').trim() || 'Người bạn giấu tên';
      const cleanWish = (wish || '').trim();
      if (!cleanWish) return null;

      const newWish = {
        id: `wish-${Date.now()}`,
        name: cleanName,
        wish: cleanWish,
        status: status,
        timestamp: new Date().toISOString()
      };

      // 1. Gửi lên server API database
      try {
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(newWish)
        });
        if (res.ok) {
          const saved = await res.json();
          newWish.id = saved.id || newWish.id;
          newWish.timestamp = saved.timestamp || newWish.timestamp;
        }
      } catch (e) {
        console.log('Lưu cục bộ vào browser');
      }

      // 2. Lưu vào localStorage để người dùng tải lại vẫn thấy lời chúc của mình
      try {
        const local = JSON.parse(localStorage.getItem('hubt_user_wishes') || '[]');
        local.unshift(newWish);
        localStorage.setItem('hubt_user_wishes', JSON.stringify(local));
      } catch (e) {}

      // 3. Cập nhật danh sách và giao diện thanh chạy ngay lập tức
      this.wishes.unshift(newWish);
      this.renderMarquee();
      this.renderModal();

      return newWish;
    },

    renderMarquee() {
      const track = document.getElementById('marquee-track');
      if (!track) return;

      if (!this.wishes || this.wishes.length === 0) {
        const welcomeText = `
          <span class="marquee-item marquee-item-welcome">
            <span class="marquee-item-name">✨ Sổ lưu bút tốt nghiệp:</span>
            <span class="marquee-item-wish">Chạm vào đây để gửi lời chúc mừng đến Tân Kỹ Sư Nguyễn Thế Đạt nhé! 🎓</span>
          </span>
          <span class="marquee-separator">✦</span>
          <span class="marquee-item marquee-item-welcome">
            <span class="marquee-item-name">💌 HUBT K27:</span>
            <span class="marquee-item-wish">Hãy là người đầu tiên để lại lời chúc lưu bút cho Đạt nhé! 🌸</span>
          </span>
          <span class="marquee-separator">✦</span>
        `;
        track.innerHTML = welcomeText + welcomeText;
        return;
      }

      // Format hiển thị chạy ngang đúng như yêu cầu User: "Tên: Lời chúc" (không hiển thị giờ)
      const itemsHtml = this.wishes.map(w => `
        <span class="marquee-item">
          <span class="marquee-item-name">${this.escapeHtml(w.name)}:</span>
          <span class="marquee-item-wish">${this.escapeHtml(w.wish)}</span>
        </span>
        <span class="marquee-separator">✦</span>
      `).join('');

      // Nhân đôi mảng nội dung để animation chạy liên tục vô tận (seamless infinite loop)
      track.innerHTML = itemsHtml + itemsHtml;
    },

    renderModal() {
      const list = document.getElementById('wishes-cards-list');
      if (!list) return;

      if (!this.wishes || this.wishes.length === 0) {
        list.innerHTML = `
          <div class="wishes-empty-state" style="text-align: center; padding: 36px 16px; color: #9ca3af;">
            <div style="font-size: 2.4rem; margin-bottom: 8px;">💌</div>
            <p style="font-size: 1rem; font-weight: 700; color: #fde047; margin: 0 0 6px;">Chưa có lời chúc nào trong sổ lưu bút</p>
            <p style="font-size: 0.84rem; color: #cbd5e1; margin: 0;">Hãy viết và gửi lời chúc đầu tiên đến Đạt ở khung phía trên nhé! ✨</p>
          </div>
        `;
        return;
      }

      // Khi xem full: Hiển thị đầy đủ Tên, Lời chúc, Mốc thời gian, Trạng thái tham gia
      list.innerHTML = this.wishes.map(w => `
        <article class="wish-card">
          <div class="wish-card-top">
            <span class="wish-card-name">${this.escapeHtml(w.name)}</span>
            <time class="wish-card-time">${this.formatTime(w.timestamp)}</time>
          </div>
          <p class="wish-card-body">${this.escapeHtml(w.wish)}</p>
          ${w.status === 'yes' ? '<span class="wish-card-status-pill">🎓 Tham gia lễ tốt nghiệp</span>' : ''}
        </article>
      `).join('');
    },

    bindEvents() {
      const marqueeBar = document.getElementById('wishes-marquee-bar');
      const modal = document.getElementById('modal-all-wishes');
      const btnClose = document.getElementById('btn-close-wishes-modal');
      const btnOpen = document.getElementById('btn-open-wishes-modal');
      const quickForm = document.getElementById('form-quick-wish');
      const quickName = document.getElementById('quick-wish-name');
      const quickText = document.getElementById('quick-wish-text');

      const openModal = (e) => {
        if (e) e.stopPropagation();
        if (!modal) return;
        this.renderModal();
        modal.style.display = 'flex';
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (quickName && !quickName.value) {
          quickName.value = state.guestName || localStorage.getItem('hubt_guest_name') || '';
        }
      };

      const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
      };
      this.openModal = openModal;
      this.closeModal = closeModal;

      // Click vào bất kỳ đâu trên thanh ngang để mở xem tất cả lời chúc
      if (marqueeBar) marqueeBar.addEventListener('click', openModal);
      if (btnOpen) btnOpen.addEventListener('click', openModal);
      if (btnClose) btnClose.addEventListener('click', closeModal);

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
          closeModal();
        }
      });

      if (quickForm) {
        quickForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = quickName ? quickName.value.trim() : '';
          const wish = quickText ? quickText.value.trim() : '';
          if (!wish) return;

          const btnSubmit = quickForm.querySelector('.btn-submit-quick-wish');
          if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span>Đang gửi...</span>';
          }

          await this.addWish(name || 'Bạn thân', wish, 'yes');

          if (quickText) quickText.value = '';
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Đã gửi thành công! ✨</span>';
            setTimeout(() => {
              btnSubmit.innerHTML = '<span>Gửi lời chúc</span> <span>✨</span>';
            }, 2000);
          }
        });
      }
    },

    escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // Khởi động module WishesDB
  WishesDB.init();

  window.__gradApp = {
    state,
    updateLayoutByDevice,
    activateDeskExplorerMode,
    openDeskDetailModal,
    closeDeskDetailModal,
    WishesDB
  };
});

