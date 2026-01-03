// Blog posts manifest
const blogPosts = [
    {
        id: 'example',
        title: 'Example Blog Post',
        date: '2024-01-01',
        filename: 'example.md'
    }
    // Add more posts here as you create them
];

// Load and render blog posts
async function loadBlogPosts() {
    const container = document.getElementById('blog-container');
    
    if (!container) {
        return;
    }

    if (blogPosts.length === 0) {
        container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '<ul class="blog-list">';
    
    for (const post of sortedPosts) {
        try {
            const response = await fetch(`posts/${post.filename}`);
            if (!response.ok) {
                console.error(`Failed to load ${post.filename}`);
                continue;
            }
            
            const markdown = await response.text();
            const content = marked.parse(markdown);
            
            // Extract first paragraph for preview (simple approach)
            const previewMatch = markdown.match(/^(.+?)(?:\n\n|$)/);
            const preview = previewMatch ? previewMatch[1].substring(0, 200) + '...' : '';
            
            const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <li class="blog-post">
                    <h2>${post.title}</h2>
                    <p class="blog-post-meta">${dateFormatted}</p>
                    <div class="blog-content">${content}</div>
                </li>
            `;
        } catch (error) {
            console.error(`Error loading ${post.filename}:`, error);
        }
    }
    
    html += '</ul>';
    container.innerHTML = html;
}

// Load posts when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
} else {
    loadBlogPosts();
}

