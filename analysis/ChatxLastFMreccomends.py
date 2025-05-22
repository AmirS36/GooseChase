from openai import OpenAI
import json
import requests
import time
import base64


# =============================================================================
# LAST.FM API FUNCTIONS
# =============================================================================

def get_lastfm_track_info(artist, track, api_key):
    """
    Get comprehensive track info from Last.fm
    """
    url = "https://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "track.getInfo",
        "api_key": api_key,
        "artist": artist,
        "track": track,
        "format": "json",
        "autocorrect": 1
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "track" in data:
                return data["track"]
        return None
    except Exception as e:
        print(f"Last.fm API error for {track}: {e}")
        return None


def get_lastfm_artist_info(artist, api_key):
    """
    Get artist info from Last.fm for additional context
    """
    url = "https://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "artist.getInfo",
        "api_key": api_key,
        "artist": artist,
        "format": "json",
        "autocorrect": 1
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "artist" in data:
                return data["artist"]
        return None
    except Exception as e:
        print(f"Last.fm artist API error for {artist}: {e}")
        return None


def extract_lastfm_features(track_info, artist_info=None):
    """
    Extract useful features from Last.fm data
    """
    features = {}

    if not track_info:
        return features

    # Basic metadata
    features["duration_ms"] = int(track_info.get("duration", 0))
    features["playcount"] = int(track_info.get("playcount", 0))
    features["listeners"] = int(track_info.get("listeners", 0))

    # Extract genre tags
    tags = track_info.get("toptags", {}).get("tag", [])
    if isinstance(tags, dict):  # Sometimes it's a single tag
        tags = [tags]

    genre_tags = [tag["name"].lower() for tag in tags if isinstance(tag, dict)]
    features["genres"] = genre_tags[:5]  # Top 5 genres

    # Popularity score (normalized)
    if features["playcount"] > 0:
        # Normalize playcount to 0-1 scale (log scale for better distribution)
        import math
        features["popularity"] = min(math.log10(features["playcount"] + 1) / 8, 1.0)
    else:
        features["popularity"] = 0.0

    # Artist info if available
    if artist_info:
        artist_tags = artist_info.get("tags", {}).get("tag", [])
        if isinstance(artist_tags, dict):
            artist_tags = [artist_tags]
        artist_genres = [tag["name"].lower() for tag in artist_tags if isinstance(tag, dict)]
        features["artist_genres"] = artist_genres[:5]

    return features


# =============================================================================
# CHATGPT AUDIO FEATURES ESTIMATION
# =============================================================================

def get_ai_estimated_audio_features(artist, track, lastfm_data, openai_client):
    """
    Use ChatGPT to estimate Spotify-like audio features with Last.fm context
    """

    # Prepare context from Last.fm data
    context = ""
    if lastfm_data:
        if lastfm_data.get("genres"):
            context += f"Genres: {', '.join(lastfm_data['genres'])}. "
        if lastfm_data.get("duration_ms", 0) > 0:
            duration_sec = lastfm_data["duration_ms"] // 1000
            context += f"Duration: {duration_sec // 60}:{duration_sec % 60:02d}. "
        if lastfm_data.get("popularity", 0) > 0.5:
            context += "This is a popular/well-known song. "

    prompt = f"""
You are a music analysis expert. Analyze the song "{track}" by {artist} and provide Spotify-style audio features.

{context}

Based on your knowledge of this song, provide these audio features (scale 0.0 to 1.0 unless specified):

- danceability: How suitable for dancing (0.0 = not danceable, 1.0 = very danceable)
- energy: Intensity and power (0.0 = calm/quiet, 1.0 = energetic/loud)
- valence: Musical positivity (0.0 = sad/negative, 1.0 = happy/positive)
- acousticness: Acoustic vs electronic (0.0 = electronic, 1.0 = acoustic)
- instrumentalness: Amount of vocals (0.0 = very vocal, 1.0 = instrumental)
- speechiness: Amount of spoken words (0.0 = singing, 1.0 = speech/rap)
- liveness: Live performance feel (0.0 = studio, 1.0 = live recording)
- loudness: Overall loudness in dB (typically -30 to 0, average around -10)
- tempo: BPM (typically 50-200)
- key: Musical key as integer (0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B)
- mode: Major (1) or Minor (0)
- time_signature: Beat count per measure (usually 3, 4, or 5)


Be accurate based on the actual song. Respond ONLY with valid JSON. Round your numbers up:

{{
    "danceability": 0.0,
    "energy": 0.0,
    "valence": 0.0,
    "acousticness": 0.0,
    "instrumentalness": 0.0,
    "speechiness": 0.0,
    "liveness": 0.0,
    "loudness": -10.0,
    "tempo": 120,
    "key": 0,
    "mode": 1,
    "time_signature": 4
}}
    """

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,  # Lower temperature for more consistent results
            max_tokens=300
        )

        result = response.choices[0].message.content.strip()

        # Clean up the JSON response
        if result.startswith("```json"):
            result = result[7:-3]
        elif result.startswith("```"):
            result = result[3:-3]

        # Parse and validate JSON
        features = json.loads(result)

        # Add metadata
        features["analysis_source"] = "chatgpt"
        features["analysis_version"] = "1.0"

        return features

    except json.JSONDecodeError as e:
        print(f"JSON parsing error for {track}: {e}")
        print(f"Raw response: {result}")
        return None
    except Exception as e:
        print(f"Error getting AI features for {track}: {e}")
        return None


# =============================================================================
# COMBINED LASTFM + CHATGPT INTEGRATION
# =============================================================================

def get_enhanced_audio_features(artist, track, lastfm_api_key, openai_client):
    """
    Combine Last.fm real data with ChatGPT estimated audio features
    """
    print(f"🎵 Analyzing: {track} by {artist}")

    # Step 1: Get Last.fm data
    print("  📡 Fetching Last.fm data...")
    lastfm_track = get_lastfm_track_info(artist, track, lastfm_api_key)
    lastfm_artist = get_lastfm_artist_info(artist, lastfm_api_key)

    # Extract Last.fm features
    lastfm_features = extract_lastfm_features(lastfm_track, lastfm_artist)

    if lastfm_features.get("genres"):
        print(f"  🏷️  Genres: {', '.join(lastfm_features['genres'][:3])}")

    # Step 2: Get AI-estimated audio features
    print("  🤖 Getting AI audio features...")
    ai_features = get_ai_estimated_audio_features(artist, track, lastfm_features, openai_client)

    # Step 3: Combine both datasets
    combined_features = {
        "track_name": track,
        "artist_name": artist,
        "audio_features": ai_features or {},
        "metadata": lastfm_features,
        "data_sources": []
    }

    # Track which data sources we successfully used
    if lastfm_features:
        combined_features["data_sources"].append("lastfm")
    if ai_features:
        combined_features["data_sources"].append("chatgpt")

    print(f"  ✅ Analysis complete! Sources: {', '.join(combined_features['data_sources'])}")

    # Add a small delay to be respectful to APIs
    time.sleep(0.5)

    return combined_features


# =============================================================================
# INTEGRATION WITH YOUR EXISTING CODE
# =============================================================================

def augment_recommendations_with_enhanced_features(recommendations, lastfm_api_key, openai_client):
    """
    Drop-in replacement for your Spotify audio features function
    """
    print(f"\n🚀 Enhancing {len(recommendations)} recommendations with Last.fm + ChatGPT...")
    print("=" * 60)

    enhanced_recommendations = []

    for i, rec in enumerate(recommendations, 1):
        print(f"\n[{i}/{len(recommendations)}]", end=" ")

        try:
            # Get enhanced features
            enhanced_data = get_enhanced_audio_features(
                rec["artist"],
                rec["title"],
                lastfm_api_key,
                openai_client
            )

            # Add enhanced data to recommendation
            rec_copy = rec.copy()
            rec_copy["audio_features"] = enhanced_data["audio_features"]
            rec_copy["metadata"] = enhanced_data["metadata"]
            rec_copy["data_sources"] = enhanced_data["data_sources"]

            enhanced_recommendations.append(rec_copy)

        except Exception as e:
            print(f"  ❌ Error processing {rec['title']}: {e}")
            # Keep original recommendation if enhancement fails
            enhanced_recommendations.append(rec)

    print(f"\n✅ Enhancement complete! {len(enhanced_recommendations)} tracks processed.")
    return enhanced_recommendations


# =============================================================================
# MAIN INTEGRATION WITH YOUR EXISTING CODE
# =============================================================================

# Your existing user profile and system prompt (unchanged)
user_profile = {
    "user_profile": {
        "user_id": "your_unique_user_id",
        "demographics": {
            "age": 23,
            "gender": "male",
            "location": "Tel Aviv, Israel"
        },
        "mood_or_activity": "melancholic evening",
        "listening_behavior": {
            "listening_history": [
                {
                    "title": "Hurt",
                    "artist": "Johnny Cash",
                    "play_count": 42,
                    "skip_count": 0,
                    "replay_count": 15
                },
                {
                    "title": "Creep",
                    "artist": "Radiohead",
                    "play_count": 30,
                    "skip_count": 1,
                    "replay_count": 8
                }
            ],
            "likes": ["Hurt", "Creep", "The Night We Met"],
            "dislikes": ["Happy", "Shake It Off"],
            "search_history": [
                "sad acoustic songs",
                "songs about regret",
                "radiohead discography"
            ],
            "playlist_activity": {
                "added": ["Breathe Me", "The Blower's Daughter"],
                "removed": ["Can't Stop the Feeling"]
            },
            "session_patterns": {
                "frequency_per_week": 6,
                "average_session_duration_minutes": 45,
                "active_hours": ["22:00", "01:00"]
            },
            "listening_context": "night-time reflection"
        },
        "liked_songs": [
            {
                "title": "Hurt",
                "artist": "Johnny Cash",
                "lyrics_excerpt": "I hurt myself today to see if I still feel...",
                "topics": ["pain", "regret", "existentialism"],
                "sentiment": "melancholic",
                "audio_features": {
                    "genre": "country",
                    "tempo_bpm": 90,
                    "key": "A minor",
                    "energy": 0.2,
                    "valence": 0.1,
                    "danceability": 0.3,
                    "loudness": -12.5,
                    "instrumentalness": 0.0,
                    "speechiness": 0.05,
                    "acousticness": 0.9
                }
            },
            {
                "title": "The Night We Met",
                "artist": "Lord Huron",
                "lyrics_excerpt": "I had all and then most of you, some and now none of you...",
                "topics": ["loss", "nostalgia", "love"],
                "sentiment": "wistful",
                "audio_features": {
                    "genre": "indie folk",
                    "tempo_bpm": 110,
                    "key": "D major",
                    "energy": 0.4,
                    "valence": 0.3,
                    "danceability": 0.5,
                    "loudness": -10.2,
                    "instrumentalness": 0.1,
                    "speechiness": 0.03,
                    "acousticness": 0.85
                }
            },
            {
                "title": "Creep",
                "artist": "Radiohead",
                "lyrics_excerpt": "I'm a creep, I'm a weirdo...",
                "topics": ["alienation", "identity", "self-doubt"],
                "sentiment": "dark",
                "audio_features": {
                    "genre": "alternative rock",
                    "tempo_bpm": 92,
                    "key": "G major",
                    "energy": 0.6,
                    "valence": 0.2,
                    "danceability": 0.4,
                    "loudness": -8.7,
                    "instrumentalness": 0.0,
                    "speechiness": 0.04,
                    "acousticness": 0.5
                }
            }
        ],
        "device_info": {
            "device_type": "mobile",
            "os": "iOS",
            "app_used": "Spotify"
        },
        "social_signals": {
            "friends_listening_to": ["Phoebe Bridgers", "Bon Iver", "Ben Howard"],
            "shared_playlists": ["Late Night Sad Vibes", "Deep Thoughts"],
            "regional_trends": ["Indie acoustic", "Alt-folk"]
        },
        "environmental_context": {
            "weather": "clear night",
            "temperature_celsius": 21
        }
    }
}

system_prompt = (
    "You are a music recommendation assistant that specializes in lyrics and emotional tone.\n"
    "A user has shared a list of songs they deeply resonate with. Each song includes a lyrics excerpt, core emotional themes, and sentiment.\n"
    "Your job is to recommend 5 new songs that are lyrically similar, emotionally aligned, or thematically relevant.\n"
    "For each song, also provide:\n"
    "1. A 20-second lyrics snippet that best matches the user's taste\n"
    "2. An estimated time range for that snippet (e.g., \"00:42 - 01:02\")\n"
    "3. The suggested lyrics as a string\n"
    "4. The suggested snippet's start and end times as separate fields (HH:MM:SS)\n"
    "5. A short reason explaining why the song and that specific part would resonate with the user\n"
    "Do not include any of the songs already liked by the user. Focus on well-known songs with emotionally rich lyrics.\n"
    "Respond in this exact JSON format:\n"
    "{\n"
    "  \"recommendations\": [\n"
    "    {\n"
    "      \"title\": \"\",\n"
    "      \"artist\": \"\",\n"
    "      \"snippet_lyrics\": \"\",\n"
    "      \"snippet_timestamps\": \"\",\n"
    "      \"suggested_lyrics\": \"\",\n"
    "      \"suggested_lyrics_start_time\": \"HH:MM:SS\",\n"
    "      \"suggested_lyrics_end_time\": \"HH:MM:SS\",\n"
    "      \"reason\": \"\"\n"
    "    }\n"
    "  ]\n"
    "}"
)


def main():
    """
    Main function - your complete music recommendation system
    """
    print("🎵 ENHANCED MUSIC RECOMMENDATION SYSTEM")
    print("🔄 Using Last.fm + ChatGPT for audio features")
    print("=" * 60)

    # API Configuration ## api keys!
    OPENAI_API_KEY = "open-api-key"  # Replace with your key
    LASTFM_API_KEY = "lastFM"  # Get from: https://www.last.fm/api/account/create

    # Initialize clients
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

    try:
        # Step 1: Get recommendations from ChatGPT
        print("📝 Getting music recommendations from ChatGPT...")
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_profile)}
            ],
            temperature=0.8
        )

        chat_output = response.choices[0].message.content

        # Clean up the response
        if chat_output.startswith("```json"):
            chat_output = chat_output[7:]
        elif chat_output.startswith("```"):
            chat_output = chat_output[3:]

        chat_output = chat_output.strip().rstrip("```")
        recommendations = json.loads(chat_output)["recommendations"]

        print(f"✅ Got {len(recommendations)} recommendations from ChatGPT")

        # Step 2: Enhance with Last.fm + ChatGPT audio features
        enhanced_recommendations = augment_recommendations_with_enhanced_features(
            recommendations,
            LASTFM_API_KEY,
            openai_client
        )

        # Step 3: Display final results
        print("\n" + "=" * 60)
        print("🎯 FINAL ENHANCED RECOMMENDATIONS")
        print("=" * 60)

        final_output = {"recommendations": enhanced_recommendations}
        print(json.dumps(final_output, indent=2))

        # Optional: Save to file
        with open("enhanced_recommendations.json", "w") as f:
            json.dump(final_output, f, indent=2)
        print("\n💾 Results saved to 'enhanced_recommendations.json'")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()