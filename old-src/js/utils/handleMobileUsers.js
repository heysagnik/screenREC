export const handleMobileUsers = () => {
  const isMobileRegExp = /mobile|android|iphone/i;
  const isMobile = isMobileRegExp.test(navigator.userAgent);

  if (isMobile) {
    alert("Sorry, we don't support mobile devices yet 🥺");
  }
};
