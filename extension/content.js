// Track which posts we've already added buttons to
const processedPosts = new Set();

// Function to extract post text
function extractPostText(postElement) {
  // LinkedIn's post content is usually in a specific container
  // Try multiple selectors in order of likelihood
  
  // Method 1: Look for the actual post content wrapper
  let textElement = postElement.querySelector('.feed-shared-text, .feed-shared-update-v2__description');
  
  // Method 2: Find all [dir="ltr"] elements and skip the author name
  if (!textElement) {
    const allLtrElements = postElement.querySelectorAll('[dir="ltr"]');
    // Skip the first one or two (usually author name) and find the one with substantial text
    for (const el of allLtrElements) {
      if (el.innerText && el.innerText.length > 50) {
        textElement = el;
        break;
      }
    }
  }
  
  // Method 3: Look for the element containing the most text
  if (!textElement) {
    const candidates = postElement.querySelectorAll('span[dir="ltr"], div.break-words');
    let maxLength = 0;
    for (const el of candidates) {
      const text = el.innerText || '';
      if (text.length > maxLength && !text.includes('Follow')) {
        maxLength = text.length;
        textElement = el;
      }
    }
  }
  
  // Method 4: Last resort - find any substantial text block
  if (!textElement) {
    const allSpans = postElement.querySelectorAll('span');
    for (const span of allSpans) {
      const text = span.innerText || '';
      // Skip author names and UI elements
      if (text.length > 100 && 
          !span.classList.contains('app-aware-link') &&
          !span.classList.contains('t-bold')) {
        textElement = span;
        break;
      }
    }
  }
  
  if (!textElement) return null;
  
  // Get all text content
  const text = textElement.innerText || textElement.textContent;
  console.log('Extracted text preview:', text.substring(0, 100) + '...');
  return text;
}

// Function to create the roast button
function createRoastButton() {
  const button = document.createElement('button');
  button.className = 'linkedin-roast-btn';
  button.innerHTML = '🔥 Get TLDR Roast';
  return button;
}

// Function to create the results display
function createResultsDisplay() {
  const display = document.createElement('div');
  display.className = 'roast-results';
  display.style.display = 'none';
  return display;
}

// Function to handle roast request
async function getRoast(postText, resultsDisplay, button) {
  // Show loading state
  button.disabled = true;
  button.innerHTML = '🔄 Roasting...';
  resultsDisplay.style.display = 'block';
  resultsDisplay.innerHTML = '<div class="roast-loading">Analyzing shitpost levels...</div>';
  
  try {
    // Send to our backend
    const response = await fetch('http://localhost:3000/roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postText })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get roast');
    }
    
    const data = await response.json();
    
    // Display results
    resultsDisplay.innerHTML = `
      <div class="roast-score">
        <span class="score-label">Shitscore:</span>
        <span class="score-value">${data.score}/100</span>
      </div>
      <div class="roast-tldr">"${data.tldr}"</div>
    `;
    
    // Reset button
    button.innerHTML = '🔥 Roast Again';
    button.disabled = false;
    
  } catch (error) {
    console.error('Roast error:', error);
    resultsDisplay.innerHTML = '<div class="roast-error">Failed to roast. Is the backend running?</div>';
    button.innerHTML = '🔥 Try Again';
    button.disabled = false;
  }
}

// Function to add roast button to posts
function addRoastButtons() {
  // Find all LinkedIn posts
  const posts = document.querySelectorAll('[data-id^="urn:li:activity"], [data-urn^="urn:li:activity"]');
  
  posts.forEach(post => {
    // Skip if we've already processed this post
    const postId = post.getAttribute('data-id') || post.getAttribute('data-urn');
    if (!postId || processedPosts.has(postId)) return;
    
    // Find the actions container (likes, comments, etc.)
    const actionsContainer = post.querySelector('.feed-shared-social-action-bar, .social-actions-bar, [data-test-id="social-actions"]');
    if (!actionsContainer) return;
    
    // Extract post text
    const postText = extractPostText(post);
    if (!postText || postText.length < 10) return; // Skip empty posts
    
    // Create and add our roast button
    const roastButton = createRoastButton();
    const resultsDisplay = createResultsDisplay();
    
    // Create container for our elements
    const roastContainer = document.createElement('div');
    roastContainer.className = 'roast-container';
    roastContainer.appendChild(roastButton);
    roastContainer.appendChild(resultsDisplay);
    
    // Add click handler
    roastButton.addEventListener('click', () => {
      getRoast(postText, resultsDisplay, roastButton);
    });
    
    // Insert after the actions bar
    actionsContainer.parentNode.insertBefore(roastContainer, actionsContainer.nextSibling);
    
    // Mark as processed
    processedPosts.add(postId);
  });
}

// Run on page load and monitor for new posts
addRoastButtons();

// LinkedIn uses dynamic loading, so we need to watch for new posts
const observer = new MutationObserver(() => {
  addRoastButtons();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also run when scrolling (LinkedIn lazy loads)
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(addRoastButtons, 500);
});