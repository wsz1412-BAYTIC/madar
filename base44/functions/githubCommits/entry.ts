import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const REPO = 'wsz1412-BAYTIC/madar';
const BRANCH = 'main';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&per_page=30`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Madar-Base44-App',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: `GitHub API returned ${response.status}` },
        { status: 502 }
      );
    }

    const commits = await response.json();

    const mapped = commits.map((c) => ({
      sha: c.sha,
      short_sha: c.sha.substring(0, 7),
      message: c.commit.message,
      author_name: c.commit.author?.name || c.author?.login || 'Unknown',
      author_login: c.author?.login || null,
      author_avatar: c.author?.avatar_url || null,
      date: c.commit.author?.date || c.commit.committer?.date,
      html_url: c.html_url,
    }));

    return Response.json({
      repo: REPO,
      branch: BRANCH,
      total: mapped.length,
      commits: mapped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});