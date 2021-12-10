import recorderClass from "./components/recorder";
import themeTogglerClass from "./components/themeToggler";

const screenHive = {};
//instance
screenHive.recorder = new recorderClass();
screenHive.theme = new themeTogglerClass();
// init
screenHive.recorder.init();
screenHive.theme.init();
