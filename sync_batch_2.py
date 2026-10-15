import urllib.request
import json
import time
import csv
from datetime import datetime, timedelta
from build_perfect_30_day import days as original_days

reordered_content = original_days[3:] + original_days[:3]
base_date = datetime(2026, 10, 15)

regular_slots = [
    ("Morning", "11:30:00Z"),
    ("Afternoon", "15:30:00Z"),
    ("Evening", "20:30:00Z")
]

calendar_90 = []
for i in range(90):
    day_offset = i // 3
    slot_idx = i % 3
    current_date = base_date + timedelta(days=day_offset)
    date_str_prefix = current_date.strftime("%Y-%m-%d")
    slot_name, time_str = regular_slots[slot_idx]
    iso_timestamp = f"{date_str_prefix}T{time_str}"
    title, _, posts = reordered_content[i]
    clean_title = f"Day {day_offset + 1} - {slot_name} ({title.split('(')[-1].replace(')', '') if '(' in title else title})"
    calendar_90.append((clean_title, iso_timestamp, posts))

# Batch 2: slots 45 to 89 (Days 16 to 30)
batch_2 = calendar_90[45:]

api_key = 'SLXlFirw67EroSEaTb3m3JJpCjP25rh0'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0'
}
social_set_id = 337894

print(f"Ready to push Batch 2 ({len(batch_2)} posts) for Days 16 through 30...")

success = 0
for idx, (title, date_str, posts) in enumerate(batch_2):
    posts_payload = [{'text': p} for p in posts]
    payload = {
        'platforms': {
            'x': {
                'enabled': True,
                'posts': posts_payload
            }
        },
        'publish_at': date_str
    }

    req = urllib.request.Request(
        f'https://api.typefully.com/v2/social-sets/{social_set_id}/drafts',
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            success += 1
            print(f"[{success}/{len(batch_2)}] Scheduled: {title} -> {date_str} (ID: {data.get('id')})")
        time.sleep(1.0)
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8')
        print(f"Stopped at {title} with HTTP {e.code}: {err}")
        break
    except Exception as e:
        print(f"Error on {title}: {e}")
        break

print(f"Batch 2 completed: {success}/{len(batch_2)} scheduled.")
