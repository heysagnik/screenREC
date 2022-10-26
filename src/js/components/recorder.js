export default class recorderClass {
  constructor() {
    if (!recorderClass.instance) {
      this.set = {
        // TODO: LOADING ANIMATION
        // logo: document.querySelector(".sh__logo"),
        // logoImg: document.querySelector(".sh__logo--img"),
        // logoText: document.querySelector(".sh__logo--text"),
        // progress: document.querySelector(".sh__progress"),
        // themeToggler: document.querySelector(".sh__toggler"),
        // footer: document.querySelector(".sh__footer"),
        start: document.getElementById("start"),
        stop: document.getElementById("stop"),
        pauseAndResume: document.getElementById("pauseAndResume"),
        preview: document.querySelector("#preview"),
        download: document.querySelector("#download"),
        recordingName: document.querySelector("#filename"),
        mimeChoiceWrapper: document.querySelector(".sh__choice"),
        videoWrapper: document.querySelector(".sh__video--wrp"),
        videoOpacitySheet: document.querySelector(".sh__video--sheet"),
        //dropdownToggle: document.querySelector(".sh__dropdown--btn"),
        dropdownList: document.querySelector(".sh__dropdown__list"),
        dropdownDefaultOption: document.querySelector(
          ".sh__dropdown--defaultOption"
        ),
        dropdownOptions: document.querySelectorAll(".sh__dropdown__list--item"),
        //dropdownChevron: document.querySelector(".sh__dropdown--icon.chevron"),
        headerText: document.querySelector(".sh__header"),
        toast: document.getElementById("toast"),
        mime: null,
        mediaRecorder: null,
        isRecording: false,
        isPause: false,
        filename:null,
      };
      recorderClass.instance = this;
    }
    return recorderClass.instance;
  }

  toggleDropdown() {
    this.set.dropdownToggle.classList.toggle("toggled");
    this.set.dropdownChevron.classList.toggle("toggled");
    this.set.dropdownList.classList.toggle("open");
  }

  getSelectedValue(el) {
    let selectedElement = el;
    let selectedAttrValue = selectedElement.getAttribute("data-value");
    selectedAttrValue !== ""
      ? this.set.start.classList.add("visible")
      : this.set.start.classList.remove("visible");
    this.set.dropdownDefaultOption.textContent = selectedElement.innerText;
    this.set.mime = selectedAttrValue;
  }

  getRandomString(length) {
    let randomChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    return result;
  }

  appendStatusNotification(actionType) {
    const notificationText =
      actionType === "start"
        ? "Started Recording"
        : actionType === "stop"
        ? "Stopped Recording"
        : actionType === "pause"
        ? "Paused Recording"
        : actionType === "resume"
        ? "Resumed Recording"
        : "";

    this.set.toast.classList.add("active");
    document.getElementById("desc").innerHTML = notificationText
    setTimeout(() => {
      this.set.toast.classList.remove("active");
    }, 4000);
  }

  createRecorder(stream) {
    // the stream data is stored in this array
    let recordedChunks = [];
    this.set.mediaRecorder = new MediaRecorder(stream);

    this.set.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    this.set.mediaRecorder.onstop = () => {
      if (this.set.isRecording) this.stopRecording();
      this.bakeVideo(recordedChunks);
      recordedChunks = [];
    };

    // When stopping 'Tab Record' on Chrome browser by clicking 'Stop sharing' button, this gets fired instead of onstop event.
    this.set.mediaRecorder.stream.oninactive = () => {
      this.stopRecording();
    };

    this.set.mediaRecorder.start(15); // For every 200ms the stream data will be stored in a separate chunk.
    return this.set.mediaRecorder;
  }

  async recordScreen() {
    return await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: { mediaSource: "screen" },
    });
  }

  bakeVideo(recordedChunks) {
    const blob = new Blob(recordedChunks, {
      type: "video/" + this.set.mime,
    });
    let savedName;
    if(this.set.filename == null || this.set.filename == "")
      savedName = this.getRandomString(15);
    else
      savedName = this.set.filename;
    this.set.download.href = URL.createObjectURL(blob);
    this.set.download.download = `${savedName}.${this.set.mime}`;
    this.set.videoOpacitySheet.remove();
    this.set.preview.autoplay = false;
    this.set.preview.controls = true;
    this.set.preview.src = URL.createObjectURL(blob);
    URL.revokeObjectURL(blob); // clear from memory
  }

  async startRecording() {
    let stream = await this.recordScreen();
    let mimeType = "video/" + this.set.mime;

    this.set.filename = document.getElementById("filename").value;
    this.set.isRecording = true;
    this.set.mediaRecorder = this.createRecorder(stream, mimeType);
    this.set.preview.srcObject = stream;
    this.set.preview.captureStream =
      this.set.preview.captureStream || this.set.preview.mozCaptureStream;
    this.set.mimeChoiceWrapper.classList.add("hide");
    this.set.headerText.classList.add("is-recording");
    this.set.preview.classList.add("visible");
    this.set.pauseAndResume.classList.add("visible");
    this.set.stop.classList.add("visible");
    this.appendStatusNotification("start");
  }

  pauseRecording() {
    this.set.mediaRecorder.pause();
    this.set.isPause = true;
    this.appendStatusNotification("pause");
    this.set.pauseAndResume.classList.add("resume");
    this.set.pauseAndResume.classList.remove("pause");
  }

  resumeRecording() {
    this.set.mediaRecorder.resume();
    this.set.isPause = false;
    this.appendStatusNotification("resume");
    this.set.pauseAndResume.classList.remove("resume");
    this.set.pauseAndResume.classList.add("pause");
  }

  stopRecording() {
    this.set.mediaRecorder.stream.getTracks().forEach((track) => track?.stop());
    const isInactive = this.set.mediaRecorder.state === "inactive"; // when stopping record with `Stop Sharing` button, isInactive is true

    this.set.isRecording = false;
    if (!isInactive) this.set.mediaRecorder.stop(); // prevents program from stopping the mediaRecorder twice, causing app to crash on chrome browser
    this.set.preview.srcObject = null;
    this.set.headerText.classList.remove("is-recording");
    this.set.headerText.classList.add("is-reviewing");
    this.set.stop.classList.remove("visible");
    this.set.pauseAndResume.classList.remove("visible");
    this.set.recordingName.classList.remove("visible");
    this.set.download.classList.add("visible");
    this.appendStatusNotification("stop");
  }

  init() {
    // TODO: LOADING ANIMATION
    // const tl = new TimelineLite({ duration: .8, delay: .4, ease: "back.out(2)", opacity: 0 });
    //
    // tl
    //     .to(this.set.progress,  { duration: 7, width: "101vw" } )
    //     .fromTo(this.set.logo, { duration: 1, opacity: 0, xPercent: -50, yPercent: 300 }, { opacity: 1, yPercent: -50, xPercent: -50, scale: .9 }, "<" )
    //     .from(".sh__logo--text .letter", { opacity: 0, x: 20, stagger: { amount: 0.80, from: "start" }}, "<")
    //     .to(this.set.logo, { scale: .7, yPercent: 3, top: "1.5%" }, "-=2")
    //     .from(this.set.themeToggler,{ yPercent: -200 } )
    //     .from(this.set.footer,{ yPercent: 200 }, "<" )
    //     .fromTo(this.set.headerText,{ opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "+=.8" )
    //     .fromTo(this.set.dropdownToggle, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=.7" )

    // this.set.dropdownToggle.addEventListener("click", () => {
    //   this.toggleDropdown();
    // });
    //
    // document.addEventListener("click", (e) => {
    //   if (this.set.dropdownToggle.classList.contains("toggled")) {
    //     if (!e.target.closest(".sh__dropdown--btn")) {
    //       this.toggleDropdown();
    //     }
    //   }
    // });

    this.set.dropdownOptions.forEach((el) => {
      el.addEventListener("click", () => {
        this.set.recordingName.classList.add("visible");
        this.getSelectedValue(el);
        this.toggleDropdown();
      });
    });

    this.set.start.addEventListener("click", () => {
      if (!this.set.isRecording) this.startRecording();
    });

    this.set.pauseAndResume.addEventListener("click", () => {
      if (!this.set.isPause) this.pauseRecording();
      else if (this.set.isPause) this.resumeRecording();
    });

    this.set.stop.addEventListener("click", () => {
      if (this.set.isRecording) this.stopRecording();
    });
  }
}
