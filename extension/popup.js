// Check if we're on LinkedIn
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const statusElement = document.getElementById('status');
  
  if (tabs[0].url.includes('linkedin.com')) {
    statusElement.textContent = '✅ Ready to roast on this page';
  } else {
    statusElement.textContent = '⚠️ Navigate to LinkedIn to start roasting';
  }
});