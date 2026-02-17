# 🏒 Project Verdict — System Architecture v1.0

---

## Overview
**Project Verdict** is a community-powered hockey penalty detection game combining computer vision, ML-based refereeing, and competitive gameplay. Users watch real hockey clips and make penalty calls, competing against an AI referee, other users, and certified officials.

---

## Component 1 — Video Ingestion & Processing Pipeline

### Input Sources
- **Community uploads** — coaches, parents, officials upload raw game footage
- **Direct clip uploads** — user submits a pre-clipped moment
- **Admin uploads** — you upload footage directly (MVP phase)

### Accepted Formats
- MP4, MOV, AVI
- Minimum resolution: **720p**
- Recommended: **1080p+**
- Maximum file size: TBD based on storage budget

### Video Quality Enhancement
- **FFmpeg preprocessing** (first pass, always runs):
  - Denoising
  - Sharpening
  - Deinterlacing
  - Contrast enhancement
- **Real-ESRGAN** (second pass, if below quality threshold):
  - Upscales low resolution footage
  - Applied selectively to avoid compute overhead
- **Topaz Video AI** (optional manual pass):
  - Used for key clips needing highest quality
  - Not automated, manual intervention

### Processing Queue
- Uploaded videos enter async processing queue
- FFmpeg runs first
- Quality score assessed
- Upscaling triggered if quality below threshold
- Proceeds to player tracking pipeline

---

## Component 2 — AI Clip Extractor

### Player & Object Tracking
- **Model:** YOLOv8 fine-tuned on hockey footage
- **Detects:** Players, referees, linesmen, puck, boards, goal
- **Tracking:** DeepSORT on top of YOLO for cross-frame identity
- **Puck tracking:** Separate lightweight model, handles occlusion

### Event Detection
- Player proximity thresholds trigger candidate flagging
- Sudden velocity changes (trips, hits)
- Stick position analysis (high sticking, slashing, hooking candidates)
- Body contact classification (incidental vs intentional)
- Outputs timestamped candidate moments

### Clip Extraction & Trimming
- 5-10 second window around flagged moment
- **Referee arm detection** — actively avoids frames where referee arm is raised (would reveal the call)
- Start point: 2-3 seconds before contact
- End point: 1-2 seconds after contact
- Output: MP4 clip with embedded timestamp

### Clip Output Metadata
```json
{
  "clip_id": "",
  "source_video_id": "",
  "timestamp_start": "",
  "timestamp_end": "",
  "game_date": "",
  "teams": "",
  "age_group": "",
  "period": "",
  "game_clock": "",
  "flagged_event_type": "",
  "player_ids_involved": [],
  "clip_quality_score": "",
  "processing_version": ""
}
```

---

## Component 3 — Clip Storage & Manual Attachment

### Storage
- **Cloudflare R2** or **AWS S3** for video files
- **PostgreSQL** for metadata and labels
- CDN delivery for low latency game serving

### Manual Annotation Layer
Admins and certified officials can attach additional information to any clip:

```json
{
  "clip_id": "",
  "game_type": "",
  "age_group": "",
  "teams": "",
  "in_game_timestamp": "",
  "game_date": "",
  "rink": "",
  "referee_id": "",
  "actual_call": "",
  "penalty_type": "",
  "penalty_severity": "",
  "mutual_penalties": false,
  "mutual_penalty_types": [],
  "notes": "",
  "verified_by": "",
  "confidence": "",
  "label_source": ""
}
```

#### Age Groups Supported
- U9, U11, U13, U15, U18, Junior, Adult Rec

#### Game Types Supported
- Regular Season, Playoffs, Tournament, Exhibition, Practice

---

## Component 4 — AI Referee

### Input
- Raw 5-10 second MP4 clip
- Optional: player tracking overlay from clip extractor

### Model Architecture
- **Stage 1:** Feature extraction from clip (CNN or fine-tuned video transformer)
- **Stage 2:** Severity classifier trained on labeled clips
- **Output:** Structured prediction

### Training Data
- Labeled clips with verified official annotations
- Two labeling approaches supported:
  - Clip only (no result shown during labeling)
  - Clip with context metadata attached
- Minimum viable training set: 500 labeled clips
- Target: 10,000+ clips for production quality

### Output
```json
{
  "clip_id": "",
  "ai_call": "",
  "confidence_score": 0,
  "predicted_type": "",
  "predicted_severity": "",
  "mutual_penalty_flag": false,
  "model_version": "",
  "reasoning_summary": ""
}
```

### Confidence Tiers
| Score | Label |
|---|---|
| 90%+ | Clear call |
| 70–90% | Probable call |
| 50–70% | Borderline |
| Below 50% | Too close to call |

---

## Component 5 — The Game

### Game Flow
```
Clip loads (no result shown)
        ↓
Video plays automatically
        ↓
User can: replay, slow mo (0.5x, 0.25x), scrub
        ↓
User submits guess:
  - Penalty / No Penalty
  - If penalty: select type
  - If penalty: select severity (2, 4, 5 min, match, gross misconduct)
  - Mutual penalty flag (optional)
        ↓
Reveal screen:
  - Actual call
  - AI referee call + confidence
  - Community vote breakdown
  - Official verdict (if labeled by certified official)
        ↓
Score awarded
        ↓
Next clip
```

### Replay & Slow Motion
- Full replay button
- 0.5x slow motion
- 0.25x slow motion
- Frame by frame scrub
- No angle switching in MVP (future feature)

### Scoring System
- Base points for correct penalty / no penalty call
- Bonus points for correct penalty type
- Bonus points for correct severity
- Consecutive correct answers = score multiplier
- Streak bonus at 5, 10, 25 in a row
- Difficulty multiplier based on clip controversy score

### Comparison Layer
After reveal, user sees:

| Comparison | Description |
|---|---|
| vs AI Referee | Did you agree with the model |
| vs Community | Percentage of users who agreed with you |
| vs Officials | How certified officials called it (if labeled) |
| vs Ref | Did you match the actual on-ice call |

### Controversial Call Mechanic
If user + AI + community majority disagree with actual ref call:
- Clip flagged as controversial
- Shown with controversy badge
- Users who disagreed with ref but matched consensus get bonus points
- Contributes to referee bias dataset over time

### Penalty Types Supported
- Hooking
- Tripping
- Interference
- Holding
- Slashing
- High Sticking
- Cross Checking
- Boarding
- Charging
- Roughing
- Fighting
- Elbowing
- Kneeing
- Delay of Game
- Too Many Men
- Unsportsmanlike Conduct
- Misconduct
- Game Misconduct
- Match Penalty
- Gross Misconduct

### Severity Options
- 2 minute minor
- 4 minute double minor
- 5 minute major
- Match penalty
- Gross misconduct

### Mutual Penalty Support
- Flag both players penalized
- Select type and severity for each

### Leaderboard
- Global all-time leaderboard
- Weekly leaderboard
- Filter by age group
- Filter by penalty type
- Officials-only leaderboard
- Friends leaderboard

### User Profile
```json
{
  "user_id": "",
  "username": "",
  "is_certified_official": false,
  "total_clips_seen": 0,
  "overall_accuracy": 0,
  "accuracy_by_penalty_type": {},
  "accuracy_by_age_group": {},
  "best_streak": 0,
  "current_streak": 0,
  "agreement_with_ai": 0,
  "agreement_with_officials": 0,
  "points_total": 0,
  "rank": 0
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Video Storage | Cloudflare R2 |
| Video Processing | FFmpeg + Real-ESRGAN |
| Object Detection | YOLOv8 |
| Player Tracking | DeepSORT |
| ML Training | PyTorch |
| Annotation Tool | Label Studio |
| Deployment | Railway or Render |
| CDN | Cloudflare |

---

## Data Flywheel

```
Community uploads footage
        ↓
AI extracts candidate clips
        ↓
Officials label clips
        ↓
AI referee trains on labels
        ↓
Game serves clips to users
        ↓
User guesses become additional labels
        ↓
Model improves
        ↓
Better clips, better AI calls
        ↓
More engaging game
        ↓
More community uploads
```

---

## Build Phases

### Phase 1 — Game MVP (No AI)
- Manual clip upload by admin
- Manual labeling by admin/officials
- Core game loop functional
- Basic scoring
- **Timeline: Weeks 1-4**

### Phase 2 — AI Referee
- Train classifier on labeled clips
- AI makes calls alongside users
- Three-way comparison mechanic unlocked
- **Timeline: Months 2-3**

### Phase 3 — AI Clip Extractor
- Full game video upload
- YOLO player tracking
- Auto clip extraction pipeline
- **Timeline: Months 4-6**

### Phase 4 — Community Features
- Community video uploads
- User accounts and profiles
- Leaderboards
- Certified official verification
- **Timeline: Months 6+**

---

*Version 1.0 — February 17, 2026*
*Update triggers: "update architecture" or "bring up architecture"*
