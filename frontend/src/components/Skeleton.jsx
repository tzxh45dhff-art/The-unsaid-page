import './Skeleton.css';

export function CardSkeleton() {
    return (
        <div className="brutal-skeleton brutal-card">
            <div className="brutal-skeleton-img"></div>
            <div className="brutal-skeleton-line title"></div>
            <div className="brutal-skeleton-line"></div>
            <div className="brutal-skeleton-line short"></div>
        </div>
    );
}

export function ReadSkeleton() {
    return (
        <div className="brutal-skeleton-read container">
            <div className="brutal-skeleton-line title" style={{ width: '60%', height: '4rem', marginTop: '4rem' }}></div>
            <div className="brutal-skeleton-line short" style={{ marginBottom: '4rem' }}></div>
            <div className="brutal-skeleton-line"></div>
            <div className="brutal-skeleton-line"></div>
            <div className="brutal-skeleton-line short"></div>
            <br />
            <div className="brutal-skeleton-line"></div>
            <div className="brutal-skeleton-line"></div>
        </div>
    );
}
