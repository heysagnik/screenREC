<img src="https://api.microlink.io?url=https%3A%2F%2Fscreen-rec.vercel.app%2F&overlay.browser=dark&overlay.background=linear-gradient(225deg%2C%20%23FF057C%200%25%2C%20%238D0B93%2050%25%2C%20%23321575%20100%25)&screenshot=true&meta=false&embed=screenshot.url"/>

# 📹 ScreenREC

A really simple web screen recorder.

<a href="https://www.producthunt.com/posts/screenrec?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-screenrec" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=322532&theme=dark" alt="ScreenREC - A really simple ad-free minimial web screen recorder | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>     <a href="https://www.producthunt.com/posts/screenrec?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-screenrec" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=322532&theme=dark&period=daily" alt="ScreenREC - A really simple ad-free minimial web screen recorder | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## 🎯 About

The project was initially developed by [Sagnik Sahoo](https://twitter.com/heysagnik) during the COVID-19 era to record the online classes.Later on it was made Open-Sourced.

## ▶️ Demo

Here you can find the live deployed version:

- [ScreenREC](https://screen-rec.vercel.app/)

## ✨ Features

✔️ Export type selector (currently MP4/WebM)<br/>
✔️ Video preview<br/>
✔️ Video download<br/>
✔️ Dark/Light mode toggle<br/>
✔️ Current OS theme detection<br/>
✔️ Ad-free<br/>
✔️ Open-Source<br/>
✔️ No Time limits<br/>
❌ Doesn't support Mobile Devices yet.

## Usage guide :
1. Choose your video format 
    - WebM : Optimised for web
    - mp4 : Optimised for compatibility 
2. Enter your desired file name
3. Click "I'm ready to record!"
4. Grant the required browser permissions to record your screen, if you are accessing the site for first time
5. Select the desired window you'd like to record through the popup.
6. Click the green button to pause/resume recording, and the red button to stop.
7. You can play your video in the browser, or click "Download now" to download.




https://user-images.githubusercontent.com/70798495/197354300-9ca7a871-cafa-4883-9926-678bc1c173a7.mp4


## Developement Guide :
   ### For Cloud or Linux Users only :

1. Using this button open this project on Gitpod. 
   
   [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/heysagnik/screenREC)
   > Skip this if you are running on Linux

2. Then in terminal clone the repository.
   ```sh
   git clone https://github.com/heysagnik/screenREC
   ```

3. Install the required npm packages using the following command.
   ```sh
   npm install
   ```
4. Run the following command to use development mode .
   ```sh
   npm start
   ``` 
5. Build the final project.
   ```sh
    npm run build
   ```
6. Or you can deploy the static site on netlify or vercel or any other platform. 

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fheysagnik%2FscreenREC)  [![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/heysagnik/screenREC)

  ### For Windows Users :

1. Fork this repo

2. Then in terminal clone the repository.
   ```sh
   git clone https://github.com/heysagnik/screenREC
   ```
3. Open the folder in your desired Code Editor (eg: VS CODE)
4. Install the required npm packages 
   ```sh
   npm install
   ```
5. Make sure you delete `.parcel-cache` & `dist` folder 📂 firstly.
6. To run the project and use in development mode.
   ```sh
   npx parcel src/index.pug
   ```
7. Build the final project.
   ```sh
   npm run build
   ```
8. Or you can deploy the static site on netlify or vercel or any other platform.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fheysagnik%2FscreenREC) 
   [![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/heysagnik/screenREC)


## 🚀 Technologies

- [Pug](https://pugjs.org/)
- [Parcel](https://parceljs.org/)
- [SASS/SCSS](https://sass-lang.com/)

## Special Thanks to all the Contributors 
<img src="https://contrib.rocks/image?repo=heysagnik/screenREC" />

 #### 🧑‍💻 Made with 💚 by ***Crazy Open-source developers*** 

