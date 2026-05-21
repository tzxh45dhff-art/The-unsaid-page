import { useEffect, useState } from 'react';
import { fetchModerationQueue, moderateEcho, moderatePost } from '../api/moderation';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function Admin() {
    useDocumentMeta({
        title: 'Moderation | The Unsaid Page',
        description: 'Admin moderation queue for posts, echoes, and reports.',
    });

    const [queue, setQueue] = useState({ posts: [], echoes: [], reports: [] });
    const [error, setError] = useState('');

    const load = () => fetchModerationQueue().then(setQueue).catch(() => setError('Admin access required.'));

    useEffect(() => {
        load();
    }, []);

    const onPostAction = async (id, status) => {
        await moderatePost(id, status, status === 'rejected' ? 'Needs revision' : '');
        load();
    };

    const onEchoAction = async (id, status) => {
        await moderateEcho(id, status);
        load();
    };

    return (
        <div className="container" style={{ padding: 'var(--nav-height) 2rem 4rem', minHeight: '80vh' }}>
            <h1>Moderation Queue</h1>
            {error && <p style={{ color: 'var(--accent-color)', margin: '0.75rem 0' }}>{error}</p>}

            <h3 style={{ marginTop: '1.25rem' }}>Pending Posts</h3>
            {queue.posts.map((p) => (
                <div key={p.id} className="brutal-card" style={{ marginTop: '0.5rem', padding: '1rem' }}>
                    <strong>{p.title}</strong>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={() => onPostAction(p.id, 'published')}>Publish</button>
                        <button className="btn" onClick={() => onPostAction(p.id, 'rejected')}>Reject</button>
                    </div>
                </div>
            ))}

            <h3 style={{ marginTop: '1.25rem' }}>Pending Echoes</h3>
            {queue.echoes.map((e) => (
                <div key={e.id} className="brutal-card" style={{ marginTop: '0.5rem', padding: '1rem' }}>
                    <p>{e.body}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={() => onEchoAction(e.id, 'approved')}>Approve</button>
                        <button className="btn" onClick={() => onEchoAction(e.id, 'hidden')}>Hide</button>
                    </div>
                </div>
            ))}

            <h3 style={{ marginTop: '1.25rem' }}>Open Reports</h3>
            {queue.reports.map((r) => (
                <div key={r.id} className="brutal-card" style={{ marginTop: '0.5rem', padding: '1rem' }}>
                    <strong>{r.target_type}</strong>: {r.reason}
                </div>
            ))}
        </div>
    );
}
