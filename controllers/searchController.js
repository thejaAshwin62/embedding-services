import { performSemanticSearch } from '../services/searchService.js';

export const search = async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      throw new Error('Query is required');
    }
    console.log('Searching for:', query);
    const searchResults = await performSemanticSearch(query);
    res.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
};

export const renderSearchPage = (req, res) => {
  res.send(`
    <h2>Image Captioning Upload</h2>
    <form action="/feedback/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required />
        <button type="submit">Upload Image</button>
    </form>

    <h2>Search Memories</h2>
    <div>
        <input type="text" id="searchQuery" placeholder="Ask about your memories (e.g., 'what did I do today morning?')" />
        <button onclick="searchMemories()">Search</button>
        <div id="searchResults"></div>
    </div>

    <script>
    async function searchMemories() {
        const query = document.getElementById('searchQuery').value;
        try {
            const response = await fetch('/search/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });
            const data = await response.json();
            const resultsDiv = document.getElementById('searchResults');
            
            if (data.error) {
                resultsDiv.innerHTML = '<p style="color: orange;">' + data.message + '</p>';
                return;
            }
            
            if (data.results && data.results.length > 0) {
                const resultHtml = data.results.map(result => 
                    '<div style="margin: 10px; padding: 10px; border: 1px solid #ccc;">' +
                    '<p><strong>Date:</strong> ' + result.Date + '</p>' +
                    '<p><strong>Time:</strong> ' + result.Time + '</p>' +
                    '<p><strong>Memory:</strong> ' + result.Feedback + '</p>' +
                    '<p><small>Score: ' + (result.Score * 100).toFixed(2) + '%</small></p>' +
                    '</div>'
                ).join('');
                resultsDiv.innerHTML = resultHtml;
            } else {
                resultsDiv.innerHTML = '<p>No memories found for this query</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('searchResults').innerHTML = 
                '<p style="color: red;">Error searching memories</p>';
        }
    }
    </script>
  `);
}; 