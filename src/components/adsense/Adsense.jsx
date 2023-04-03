// import React, { useEffect } from "react";
// import { toast } from "react-toastify";
// import config from "../../utils/config";

// const Adsense = () => {
//     useEffect(() => {
//         //pushadvertise

//         const pushAdsense = () => {
//             try {
//                 const adsbygoogle = window.adsbygoogle;
//        
//                 adsbygoogle.push({});
//             } catch (e) {
//                 toast.error(e);
//             }
//         };

//         let interval = setInterval(() => {
//             // Check if Adsense script is loaded every 300ms
//             if (window.adsbygoogle) {
//                 pushAdsense();
//                 // clear the interval once the ad is pushed so that function isn't called indefinitely
//                 clearInterval(interval);
//             }
//         }, 300);

//         return () => {
//             clearInterval(interval);
//         };
//     }, []);
//     return (
//         <ins
//             className="adsbygoogle"
//             // style={{ display: "inline-block", }}
//             data-ad-client={config.googleAddsense}
//             // data-ad-slot="xxxxx"
//             // data-adtest="on"
//             data-ad-format="auto"
//         ></ins>
//     );
// };
// export default Adsense;
