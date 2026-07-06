"""Download category-specific demo images to public/images for offline-reliable rendering."""
import os
import urllib.request

BASE = os.path.join(os.path.dirname(__file__), '..', 'public', 'images')

# Picsum photo IDs per category (royalty-free placeholders)
CATEGORY_PICS = {
    'engineering': {'cover': 119, 'logo': 106, 'gallery': [250, 251, 289]},
    'medical': {'cover': 357, 'logo': 447, 'gallery': [338, 339, 340]},
    'management': {'cover': 180, 'logo': 366, 'gallery': [306, 326, 431]},
    'law': {'cover': 382, 'logo': 174, 'gallery': [382, 383, 384]},
    'design': {'cover': 399, 'logo': 188, 'gallery': [399, 400, 401]},
    'science': {'cover': 400, 'logo': 160, 'gallery': [60, 274, 400]},
    'arts': {'cover': 429, 'logo': 107, 'gallery': [24, 429, 65]},
}

# 28 colleges — slug + category (must match Backend/scripts/seedData.ts)
COLLEGES = [
    ('iit-delhi', 'engineering'), ('iit-bombay', 'engineering'), ('bits-pilani', 'engineering'), ('nit-trichy', 'engineering'),
    ('aiims-delhi', 'medical'), ('cmc-vellore', 'medical'), ('mamc-delhi', 'medical'), ('kgmu-lucknow', 'medical'),
    ('iim-ahmedabad', 'management'), ('fms-delhi', 'management'), ('xlri-jamshedpur', 'management'), ('spjimr-mumbai', 'management'),
    ('nlsiu-bangalore', 'law'), ('nlu-delhi', 'law'), ('nalsar-hyderabad', 'law'), ('glc-mumbai', 'law'),
    ('nid-ahmedabad', 'design'), ('mitid-pune', 'design'), ('pearl-academy-delhi', 'design'), ('srishti-bangalore', 'design'),
    ('iisc-bangalore', 'science'), ('st-xaviers-mumbai', 'science'), ('iiser-pune', 'science'), ('du-science', 'science'),
    ('du-arts', 'arts'), ('jnu-delhi', 'arts'), ('loyola-chennai', 'arts'), ('christ-bangalore', 'arts'),
]

STREAM_COVERS = {
    'engineering': 119, 'medical': 357, 'management': 180, 'commerce': 366,
    'law': 382, 'design': 399, 'science': 400, 'arts': 429,
    'dental': 447, 'ai': 0, 'online-mba': 1, 'research': 60,
}

DOWNLOADS: dict[str, str] = {}


def add(path: str, picsum_id: int, w: int, h: int):
    DOWNLOADS[path] = f'https://picsum.photos/id/{picsum_id}/{w}/{h}'


# Per-college cover + logo (category-specific base IDs with slug offset)
for i, (slug, category) in enumerate(COLLEGES):
    pics = CATEGORY_PICS[category]
    cover_id = pics['cover']
    logo_id = pics['logo']
    add(f'colleges/{category}/{slug}-cover.jpg', cover_id, 1200, 600)
    add(f'colleges/{category}/{slug}-logo.jpg', logo_id, 400, 400)

# Category gallery images (shared within category)
for category, pics in CATEGORY_PICS.items():
    for gi, gid in enumerate(pics['gallery'], start=1):
        add(f'colleges/{category}/gallery-{gi}.jpg', gid, 800, 600)

# Course stream covers
for stream, pid in STREAM_COVERS.items():
    add(f'courses/{stream}.jpg', pid, 800, 500)

# Articles, avatars, careers, fallback
LEGACY = {
    'articles/study.jpg': (24, 1200, 700),
    'articles/ai-education.jpg': (48, 1200, 700),
    'articles/skills.jpg': (64, 1200, 700),
    'articles/campus.jpg': (65, 1200, 700),
    'articles/scholarship.jpg': (91, 1200, 700),
    'articles/placement.jpg': (96, 1200, 700),
    'articles/books.jpg': (102, 1200, 700),
    'articles/tech.jpg': (104, 1200, 700),
    'avatars/student-1.jpg': (338, 200, 200),
    'avatars/student-2.jpg': (339, 200, 200),
    'avatars/student-3.jpg': (340, 200, 200),
    'avatars/professional-1.jpg': (341, 200, 200),
    'avatars/parent.jpg': (342, 200, 200),
    'avatars/counselor.jpg': (343, 200, 200),
    'careers/ai.jpg': (0, 800, 500),
    'careers/software.jpg': (119, 800, 500),
    'careers/data.jpg': (48, 800, 500),
    'careers/finance.jpg': (180, 800, 500),
    'careers/product.jpg': (366, 800, 500),
    'careers/biotech.jpg': (357, 800, 500),
    'fallback.jpg': (433, 800, 500),
}
for path, (pid, w, h) in LEGACY.items():
    add(path, pid, w, h)


def main():
    downloaded = 0
    skipped = 0
    for rel_path, url in DOWNLOADS.items():
        dest = os.path.join(BASE, rel_path.replace('/', os.sep))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f'skip {rel_path}')
            skipped += 1
            continue
        print(f'download {rel_path}...')
        try:
            urllib.request.urlretrieve(url, dest)
            downloaded += 1
        except Exception as e:
            print(f'  warn: failed {rel_path}: {e}')
    print(f'Done — {downloaded} downloaded, {skipped} skipped, {len(DOWNLOADS)} total in {BASE}')


if __name__ == '__main__':
    main()
