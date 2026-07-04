import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const REPO = 'wsz1412-BAYTIC/madar';
const BRANCH = 'main';

// PR #26 merge commit — all commits after this are "recent updates" (#26+)
const SINCE_SHA = '5aed3925ffeb2e10e23af762a8f2ec3847cf577b';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sinceSha = body.since_sha || SINCE_SHA;
    const all = body.all === true;

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
      message: c.commit.message.split('\n')[0],
      full_message: c.commit.message,
      author_name: c.commit.author?.name || c.author?.login || 'Unknown',
      author_login: c.author?.login || null,
      author_avatar: c.author?.avatar_url || null,
      date: c.commit.author?.date || c.commit.committer?.date,
      html_url: c.html_url,
    }));

    // Filter: only commits AFTER the since_sha (newer commits precede it in the array)
    let filtered = mapped;
    let markerIndex = -1;
    if (!all && sinceSha) {
      markerIndex = mapped.findIndex((c) => c.sha === sinceSha);
      if (markerIndex >= 0) {
        filtered = mapped.slice(0, markerIndex);
      }
    }

    return Response.json({
      repo: REPO,
      branch: BRANCH,
      since_sha: sinceSha,
      since_pr: 26,
      total: filtered.length,
      total_all: mapped.length,
      commits: filtered,
      marker_commit: markerIndex >= 0 ? mapped[markerIndex] : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});