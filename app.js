document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const suggestionsBox = document.getElementById('suggestions');
    const wordCount = document.getElementById('word-count');
    const clearButton = document.getElementById('clear-button');
    const copyButton = document.getElementById('copy-button');
    const downloadButton = document.getElementById('download-button');
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    
    let cursorPosition = 0;
    let typingTimer;
    const doneTypingInterval = 200; // Wait 200ms after user stops typing

    // Dictionary for word suggestions - grouped by first letter for better performance
    const dictionary = {
        a: ['apple', 'application', 'amazing', 'automobile', 'architect', 'android', 'azure', 'awesome', 'algorithm', 'artificial', 'analogy', 'academic', 'achievement', 'apartment', 'adventure'],
        b: ['banana', 'beautiful', 'business', 'basketball', 'bicycle', 'battery', 'butterfly', 'building', 'birthday', 'browser', 'brilliant', 'benefit', 'balance', 'background', 'brother'],
        c: ['computer', 'creative', 'coffee', 'chocolate', 'customer', 'container', 'country', 'conversation', 'cinema', 'celebration', 'challenge', 'captain', 'character', 'collection', 'content'],
        d: ['developer', 'digital', 'document', 'database', 'dictionary', 'desktop', 'destination', 'discount', 'delivery', 'diamond', 'decision', 'daughter', 'director', 'discover', 'difference'],
        e: ['example', 'elephant', 'engineer', 'evolution', 'evening', 'education', 'equipment', 'exercise', 'experience', 'employee', 'experiment', 'electricity', 'environment', 'essential', 'emergency'],
        f: ['function', 'football', 'framework', 'festival', 'fantastic', 'favorite', 'factory', 'furniture', 'foundation', 'feature', 'fraction', 'freedom', 'friendship', 'framework', 'family'],
        g: ['google', 'guitar', 'government', 'graphic', 'generation', 'gravity', 'gesture', 'galaxy', 'gathering', 'gradient', 'generous', 'guidance', 'gallery', 'guarantee', 'global'],
        h: ['hello', 'happy', 'highway', 'hospital', 'holiday', 'husband', 'history', 'heritage', 'hardware', 'highlight', 'harmony', 'humanity', 'healthy', 'horizon', 'humidity'],
        i: ['internet', 'information', 'important', 'innovation', 'intelligence', 'identity', 'interface', 'imagine', 'interest', 'invitation', 'impressive', 'influence', 'investment', 'initiative', 'industry'],
        j: ['javascript', 'journey', 'justice', 'jacket', 'jungle', 'jewelry', 'journal', 'junction', 'january', 'journalist', 'judgment', 'jubilee', 'juvenile', 'jealous', 'joyful'],
        k: ['keyboard', 'knowledge', 'kitchen', 'kingdom', 'kangaroo', 'kindness', 'keeper', 'kettle', 'karate', 'knitting', 'kilogram', 'keynote', 'kinetic', 'kaleidoscope', 'kiosk'],
        l: ['language', 'laptop', 'learning', 'library', 'lightning', 'landscape', 'liberty', 'lesson', 'lifestyle', 'location', 'leadership', 'literature', 'lifetime', 'laboratory', 'legendary'],
        m: ['machine', 'mobile', 'mountain', 'message', 'memory', 'midnight', 'magazine', 'musician', 'marketing', 'material', 'medicine', 'motivation', 'management', 'momentum', 'magnificent'],
        n: ['network', 'natural', 'navigate', 'notebook', 'nature', 'nutrition', 'neighbor', 'narrative', 'northern', 'nomination', 'national', 'negotiation', 'notification', 'neutral', 'november'],
        o: ['online', 'orange', 'operation', 'objective', 'original', 'official', 'orchestra', 'optimize', 'organize', 'ordinary', 'opinion', 'obstacle', 'occasion', 'otherwise', 'outcome'],
        p: ['product', 'program', 'perfect', 'package', 'password', 'parallel', 'pattern', 'platform', 'positive', 'potential', 'possible', 'psychology', 'production', 'professional', 'performance'],
        q: ['question', 'quality', 'quantity', 'quantum', 'quarter', 'quotation', 'qualified', 'quickest', 'quietly', 'quintessential', 'quizzical', 'quandary', 'quorum', 'quarrel', 'quadratic'],
        r: ['react', 'research', 'rainbow', 'restaurant', 'revolution', 'realistic', 'reasonable', 'relative', 'relationship', 'reference', 'responsible', 'reputation', 'remarkable', 'recognize', 'reflection'],
        s: ['software', 'solution', 'student', 'security', 'strategy', 'scientist', 'specific', 'standard', 'selection', 'signature', 'situation', 'structure', 'sensation', 'significant', 'satisfaction'],
        t: ['technology', 'telephone', 'tutorial', 'tomorrow', 'teacher', 'tradition', 'template', 'together', 'thousand', 'technique', 'tropical', 'treatment', 'transfer', 'treasure', 'transformation'],
        u: ['universe', 'ultimate', 'understand', 'umbrella', 'university', 'unexpected', 'unlimited', 'useful', 'unusual', 'universal', 'unfortunate', 'underwear', 'undertake', 'upgrade', 'upwards'],
        v: ['virtual', 'vehicle', 'version', 'valuable', 'vocabulary', 'vertical', 'verified', 'violation', 'visitor', 'volunteer', 'velocity', 'variable', 'victory', 'venture', 'variation'],
        w: ['website', 'welcome', 'windows', 'weather', 'wonderful', 'warrior', 'wireless', 'workshop', 'weekend', 'waterfall', 'weakness', 'watching', 'whatever', 'whispering', 'wavelength'],
        x: ['xylophone', 'xenon', 'xerox', 'xavier', 'xenial', 'xanadu', 'xebec', 'xenophobia', 'xylem', 'xeric', 'xenograft', 'xanthic', 'xenolith', 'xerography', 'xiphoid'],
        y: ['yellow', 'yourself', 'youtube', 'yesterday', 'yearbook', 'yogurt', 'younger', 'yearning', 'yielding', 'youthful', 'yearlong', 'yorkshire', 'yardstick', 'yawning', 'youngster'],
        z: ['zombie', 'zealous', 'zigzag', 'zoology', 'zenith', 'zodiac', 'zephyr', 'zucchini', 'zero', 'zestful', 'zeppelin', 'zealot', 'zooming', 'zipper', 'zircon']
    };
    
    // Function to get suggestions locally
    function getSuggestions(prefix) {
        if (!prefix || prefix.length === 0) return [];
        
        // Convert to lowercase for case-insensitive matching
        prefix = prefix.toLowerCase();
        const firstChar = prefix.charAt(0);
        
        // If we have words starting with this character, filter them
        if (dictionary[firstChar]) {
            return dictionary[firstChar].filter(word => 
                word.startsWith(prefix)
            ).slice(0, 10); // Limit to 10 suggestions for better performance
        }
        
        return [];
    }
    
    // Initialize theme from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeLabel.textContent = 'Light Mode';
    }
    
    // Theme toggle functionality
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
            themeLabel.textContent = 'Light Mode';
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('darkMode', 'false');
            themeLabel.textContent = 'Dark Mode';
        }
    });
    
    // Clear button functionality
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the editor?')) {
            editor.value = '';
            updateWordCount();
        }
    });
    
    // Copy button functionality
    copyButton.addEventListener('click', () => {
        editor.select();
        document.execCommand('copy');
        
        // Show a temporary tooltip
        const tooltip = document.createElement('div');
        tooltip.style.position = 'fixed';
        tooltip.style.top = '20px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.padding = '10px 20px';
        tooltip.style.backgroundColor = 'var(--primary-color)';
        tooltip.style.color = 'white';
        tooltip.style.borderRadius = 'var(--border-radius)';
        tooltip.style.zIndex = '9999';
        tooltip.textContent = 'Text copied to clipboard!';
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 2000);
    });
    
    // Download button functionality
    downloadButton.addEventListener('click', () => {
        const text = editor.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'smart-editor-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Update word count
    function updateWordCount() {
        const text = editor.value;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const charCount = text.length;
        document.getElementById('word-count').textContent = `Words: ${wordCount} | Characters: ${charCount}`;
    }
    
    editor.addEventListener('input', () => {
        const text = editor.value;
        cursorPosition = editor.selectionStart;
        
        // Update word count
        updateWordCount();
        
        // Get the word being typed
        const textBeforeCursor = text.substring(0, cursorPosition);
        const words = textBeforeCursor.split(/\s+/);
        const currentWord = words[words.length - 1];
        
        // Clear the previous timer
        clearTimeout(typingTimer);
        
        if (currentWord.length >= 2) {
            // Set a new timer
            typingTimer = setTimeout(() => {
                // Get local suggestions
                const suggestions = getSuggestions(currentWord);
                
                if (suggestions.length > 0) {
                    displaySuggestions(suggestions);
                } else {
                    hideSuggestions();
                }
            }, doneTypingInterval);
        } else {
            hideSuggestions();
        }
    });
    
    editor.addEventListener('keydown', (e) => {
        if (suggestionsBox.style.display === 'block') {
            const items = suggestionsBox.querySelectorAll('.suggestion-item');
            let activeItem = suggestionsBox.querySelector('.active');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!activeItem) {
                    items[0].classList.add('active');
                    items[0].scrollIntoView({ block: 'nearest' });
                } else {
                    activeItem.classList.remove('active');
                    const nextItem = activeItem.nextElementSibling || items[0];
                    nextItem.classList.add('active');
                    nextItem.scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!activeItem) {
                    items[items.length - 1].classList.add('active');
                    items[items.length - 1].scrollIntoView({ block: 'nearest' });
                } else {
                    activeItem.classList.remove('active');
                    const prevItem = activeItem.previousElementSibling || items[items.length - 1];
                    prevItem.classList.add('active');
                    prevItem.scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (activeItem) {
                    applySuggestion(activeItem.textContent);
                }
            } else if (e.key === 'Escape') {
                hideSuggestions();
            }
        }
    });
    
    // Mobile touch events for the editor
    let touchStartY = 0;
    editor.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    editor.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const scrollTop = editor.scrollTop;
        const scrollHeight = editor.scrollHeight;
        const clientHeight = editor.clientHeight;
        
        // Allow scrolling inside the editor
        if ((scrollTop === 0 && touchY > touchStartY) || 
            (scrollTop + clientHeight >= scrollHeight && touchY < touchStartY)) {
            e.stopPropagation();
        }
    });
    
    function showLoadingIndicator() {
        // Create loader if it doesn't exist
        if (!document.getElementById('suggestions-loader')) {
            const loader = document.createElement('div');
            loader.id = 'suggestions-loader';
            loader.className = 'suggestions-loader';
            loader.innerHTML = '<div class="loader-dot"></div><div class="loader-dot"></div><div class="loader-dot"></div>';
            
            // Add loader styles
            const style = document.createElement('style');
            style.textContent = `
                .suggestions-loader {
                    position: absolute;
                    bottom: -30px;
                    left: 10px;
                    display: flex;
                    gap: 5px;
                }
                .loader-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--primary-color);
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .loader-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .loader-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(0.5); opacity: 0.5; }
                    50% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.querySelector('.editor-container').appendChild(loader);
        }
        
        document.getElementById('suggestions-loader').style.display = 'flex';
    }
    
    function hideLoadingIndicator() {
        const loader = document.getElementById('suggestions-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    function displaySuggestions(suggestions) {
        suggestionsBox.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => applySuggestion(suggestion));
            suggestionsBox.appendChild(item);
        });
        
        // Position the suggestions box
        const editorRect = editor.getBoundingClientRect();
        
        // Always position dropdown at the bottom of the text area
        const isMobile = window.innerWidth <= 600;
        
        // Set dropdown width based on screen size
        const dropdownWidth = isMobile ? Math.min(300, editorRect.width * 0.9) : 220;
        
        // Calculate the position to be at the bottom of the editor
        const editorBottomPosition = editor.offsetTop + editor.offsetHeight;
        
        // Position dropdown at the bottom of the editor
        suggestionsBox.style.position = 'absolute';
        suggestionsBox.style.top = `${editorBottomPosition + 5}px`; // 5px gap
        suggestionsBox.style.width = `${dropdownWidth}px`;
        
        if (isMobile) {
            suggestionsBox.style.left = '50%';
            suggestionsBox.style.transform = 'translateX(-50%)';
        } else {
            suggestionsBox.style.left = '0';
            suggestionsBox.style.transform = '';
        }
        
        suggestionsBox.style.display = 'block';
    }
    
    function getCursorCoordinates() {
        // Create a dummy element to measure text
        const dummy = document.createElement('div');
        dummy.style.position = 'absolute';
        dummy.style.visibility = 'hidden';
        dummy.style.whiteSpace = 'pre-wrap';
        dummy.style.font = window.getComputedStyle(editor).font;
        dummy.style.padding = window.getComputedStyle(editor).padding;
        dummy.style.width = window.getComputedStyle(editor).width;
        dummy.style.lineHeight = window.getComputedStyle(editor).lineHeight;
        dummy.style.boxSizing = 'border-box';
        
        // Copy text up to the cursor
        const textBeforeCursor = editor.value.substring(0, cursorPosition);
        const textNode = document.createTextNode(textBeforeCursor);
        dummy.appendChild(textNode);
        
        // Add a span where the cursor is
        const cursorSpan = document.createElement('span');
        cursorSpan.id = 'cursor-position-marker';
        dummy.appendChild(cursorSpan);
        
        // Append to body, measure, then remove
        document.body.appendChild(dummy);
        const rect = document.getElementById('cursor-position-marker').getBoundingClientRect();
        document.body.removeChild(dummy);
        
        // Get editor position
        const editorRect = editor.getBoundingClientRect();
        const editorScrollLeft = editor.scrollLeft || 0;
        const editorScrollTop = editor.scrollTop || 0;
        
        return {
            left: rect.left - editorRect.left + editorScrollLeft,
            top: rect.top - editorRect.top + editorScrollTop
        };
    }
    
    function applySuggestion(suggestion) {
        const text = editor.value;
        const textBeforeCursor = text.substring(0, cursorPosition);
        const textAfterCursor = text.substring(cursorPosition);
        
        // Replace the current word with the suggestion
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words.pop();
        
        const newText = words.join(' ') + (words.length > 0 ? ' ' : '') + suggestion + ' ' + textAfterCursor;
        
        editor.value = newText;
        
        // Set cursor position after the inserted word
        const newCursorPosition = textBeforeCursor.length - lastWord.length + suggestion.length + 1;
        editor.setSelectionRange(newCursorPosition, newCursorPosition);
        
        hideSuggestions();
        editor.focus();
        
        // Update word count after suggestion is applied
        updateWordCount();
    }
    
    function hideSuggestions() {
        suggestionsBox.style.display = 'none';
    }
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== suggestionsBox && !suggestionsBox.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Initialize word count
    updateWordCount();
    
    // Welcome message
    setTimeout(() => {
        const welcomeText = "Welcome to Smart Text Editor! Start typing to see word suggestions...";
        if (editor.value === '') {
            editor.placeholder = welcomeText;
        }
    }, 1000);
    
    // Check for saved text in localStorage
    const savedText = localStorage.getItem('editorText');
    if (savedText) {
        editor.value = savedText;
        updateWordCount();
    }
    
    // Save text to localStorage when user types
    editor.addEventListener('input', () => {
        localStorage.setItem('editorText', editor.value);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (suggestionsBox.style.display === 'block') {
            // Reposition suggestions box
            const editorRect = editor.getBoundingClientRect();
            
            // Always position dropdown at the bottom of the text area when window resizes
            const isMobile = window.innerWidth <= 600;
            
            // Set dropdown width based on screen size
            const dropdownWidth = isMobile ? Math.min(300, editorRect.width * 0.9) : 220;
            
            // Calculate the position to be at the bottom of the editor
            const editorBottomPosition = editor.offsetTop + editor.offsetHeight;
            
            // Position dropdown at the bottom of the editor
            suggestionsBox.style.position = 'absolute';
            suggestionsBox.style.top = `${editorBottomPosition + 5}px`; // 5px gap
            suggestionsBox.style.width = `${dropdownWidth}px`;
            
            if (isMobile) {
                suggestionsBox.style.left = '50%';
                suggestionsBox.style.transform = 'translateX(-50%)';
            } else {
                suggestionsBox.style.left = '0';
                suggestionsBox.style.transform = '';
            }
        }
    });
    
    // Add a scroll event listener to ensure the editor is always in view on mobile
    if ('ontouchstart' in window) {
        window.addEventListener('scroll', () => {
            if (suggestionsBox.style.display === 'block') {
                const editorRect = editor.getBoundingClientRect();
                if (editorRect.bottom < 0 || editorRect.top > window.innerHeight) {
                    hideSuggestions();
                }
            }
        });
    }
});