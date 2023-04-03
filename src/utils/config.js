var config = {
  // Set the Demo Version
  demo: false,

  // googleAddsense
  // googleAddsense: "",

  //SEO Configurations
  appName: "ArcadianRift - Quiz App",
  metaDescription: "Test your knowledge with ArcadianRift Quiz Application, a fun and interactive quiz app that covers a range of subjects including history, science, and literature. With a user-friendly interface and carefully curated questions, you'll be sure to learn something new with every quiz. Built using modern web technologies like React and Redux, it's optimized for both desktop and mobile devices. Get started today and challenge yourself with the ArcadianRift Quiz Application!",
  metaKeyWords: "ArcadianRift Quiz, Questions ,Answers ,Online Quiz, ArcadianRift",
  //API Configurations
  apiAccessKey: 8525,
  apiUrl: "https://localhost/api/",

  //Language Configurations
  // Get Your Language Codes ---> https://developers.google.com/admin-sdk/directory/v1/languages
  supportedLanguages: ["en", "hi", "ur"],
  defaultLanguage: "en",

  // If your Default Language is not in supportedLanguages then add there first and after that set the defaultLanguage.

  //Quiz Configurations
  deductReviewAnswerCoins: 10, // 10 coins will be deducted if user Review the Answer
  deductIncorrectAnswerScore: 1, // This will deduct the points if user will give wrong answer
  deductLifeLineCoins: 1, // Deduct Coins when using Life Line

  // default country selection Configurations
  DefaultCountrySelectedInMobile: "in", //Default Country Selected in Mobile Login Screen

  // guess the word Quiz Configurations
  Guessthewordhintcoin: 5, //deduct coins guess the word

  // 1 vs 1 battle Quiz Configurations
  // matchrandomBattleSeconds: 30,
  battlecorrectanswer: 4,
  randomBattleSeconds:30, // 1 vs 1 battle timer seconds
  Randombattlecoins: 5, //deduct coins 1 vs 1 battle
  randomBattleoneToTwoSeconds: 2, // quick answer :- 1 vs 1 battle points 2 added on first 1 & 2 seconds
  randomBattlethreeToFourSeconds: 1, // quick answer :- 1 vs 1 battle points 1 added on first 3 & 4 seconds

  //Firebase Configurations

  apiKey: "AIzaSyDSdZ7YeDYJBICBEfxTUC9BTBlOBI_aoOE",
  authDomain: "arcadianrift-quiz-app.firebaseapp.com",
  projectId: "arcadianrift-quiz-app",
  storageBucket: "arcadianrift-quiz-app.appspot.com",
  messagingSenderId: "673842074672",
  appId: "1:673842074672:web:6340781c953319c73ac9f5",
  measurementId: "G-759W69GDNM",

  //footer area
  companytext: "ArcadianRift Quiz Application is a product of ArcadianRift LLC, a leading provider of educational and interactive applications. Our mission is to make learning fun and accessible to everyone, and we believe that the ArcadianRift Quiz Application is a testament to that. With our team of experienced developers and educators, we're committed to providing high-quality and engaging applications that inspire learning and creativity. Contact us today to learn more about our products and services!",
  addresstext: "Address: J2R3+9V, Quezon City, 1115 Metro Manila, Philippines.",
  phonenumber: "+63 9603081197",
  email: "support@arcadianrift.com",
  facebooklink: "https://www.facebook.com/arcadianriftllc",
  weblink: "https://arcadianrift.com/",
  companyname: "ArcadianRift LLC.",
};

export default config;
