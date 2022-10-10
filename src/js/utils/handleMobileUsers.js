export const handleMobileUsers = () => {
  const isMobileRegExp = /mobile|android|iphone/i;
  const isMobile = isMobileRegExp.test(navigator.userAgent);

  if (isMobile) {
    alert("Sorry, this app does not support mobile devices yet.");
  }
};