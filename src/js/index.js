import recorderClass from "./components/recorder";
import themeTogglerClass from "./components/themeToggler";

const screenRec = {};
//instance
screenRec.recorder = new recorderClass();
screenRec.theme = new themeTogglerClass();
// init
screenRec.recorder.init();
screenRec.theme.init();
