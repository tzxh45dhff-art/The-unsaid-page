import asyncio
import re
import math
import uuid
import datetime
import psycopg
from psycopg.rows import dict_row

from config import settings

# Configuration from settings
DB_CONN = (
    f"host={settings.db_host} "
    f"port={settings.db_port} "
    f"dbname={settings.db_name} "
    f"user={settings.db_user} "
    f"password={settings.db_password} "
    f"sslmode=require"
)

MOCK_DATA = {
    'road-not-taken': {
        'title': 'The Road Not Taken',
        'author': 'Robert Frost',
        'type': 'poem',
        'body': """Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\nTo where it bent in the undergrowth;\n\nThen took the other, as just as fair,\nAnd having perhaps the better claim,\nBecause it was grassy and wanted wear;\nThough as for that the passing there\nHad worn them really about the same,\n\nAnd both that morning equally lay\nIn leaves no step had trodden black.\nOh, I kept the first for another day!\nYet knowing how way leads on to way,\nI doubted if I should ever come back.\n\nI shall be telling this with a sigh\nSomewhere ages and ages hence:\nTwo roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference.""",
        'excerpt': 'Two roads diverged in a yellow wood, and sorry I could not travel both...',
        'cover_image_url': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80'
    },
    'stopping-by-woods': {
        'title': 'Stopping by Woods on a Snowy Evening',
        'author': 'Robert Frost',
        'type': 'poem',
        'body': """Whose woods these are I think I know.\nHis house is in the village though;\nHe will not see me stopping here\nTo watch his woods fill up with snow.\n\nMy little horse must think it queer\nTo stop without a farmhouse near\nBetween the woods and frozen lake\nThe darkest evening of the year.\n\nHe gives his harness bells a shake\nTo ask if there is some mistake.\nThe only other sound's the sweep\nOf easy wind and downy flake.\n\nThe woods are lovely, dark and deep,\nBut I have promises to keep,\nAnd miles to go before I sleep,\nAnd miles to go before I sleep.""",
        'excerpt': 'Whose woods these are I think I know. His house is in the village though...',
        'cover_image_url': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=800&q=80'
    },
    'fire-and-ice': {
        'title': 'Fire and Ice',
        'author': 'Robert Frost',
        'type': 'poem',
        'body': """Some say the world will end in fire,\nSome say in ice.\nFrom what I've tasted of desire\nI hold with those who favor fire.\nBut if it had to perish twice,\nI think I know enough of hate\nTo say that for destruction ice\nIs also great\nAnd would suffice.""",
        'excerpt': 'Some say the world will end in fire, some say in ice...',
        'cover_image_url': 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?auto=format&fit=crop&w=800&q=80'
    },
    'nothing-gold-can-stay': {
        'title': 'Nothing Gold Can Stay',
        'author': 'Robert Frost',
        'type': 'poem',
        'body': """Nature's first green is gold,\nHer hardest hue to hold.\nHer early leaf's a flower;\nBut only so an hour.\nThen leaf subsides to leaf.\nSo Eden sank to grief,\nSo dawn goes down to day.\nNothing gold can stay.""",
        'excerpt': "Nature's first green is gold, her hardest hue to hold...",
        'cover_image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    },
    'sonnet-18': {
        'title': 'Sonnet 18 — Shall I Compare Thee',
        'author': 'William Shakespeare',
        'type': 'poem',
        'body': """Shall I compare thee to a summer's day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date;\n\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimm'd;\nAnd every fair from fair sometime declines,\nBy chance or nature's changing course untrimm'd;\n\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou owest;\nNor shall death brag thou wander'st in his shade,\nWhen in eternal lines to time thou growest:\n\nSo long as men can breathe or eyes can see,\nSo long lives this, and this gives life to thee.""",
        'excerpt': "Shall I compare thee to a summer's day? Thou art more lovely and more temperate...",
        'cover_image_url': 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=800&q=80'
    },
    'the-ball-poem': {
        'title': 'The Ball Poem',
        'author': 'John Berryman',
        'type': 'poem',
        'body': """What is the boy now, who has lost his ball,\nWhat, what is he to do? I saw it go\nMerrily bouncing, down the street, and then\nMerrily over — there it is in the water!\nNo use to say 'O there are other balls':\nAn ultimate shaking grief fixes the boy\nAs he stands rigid, trembling, staring down\nAll his young days into the harbour where\nHis ball went. I would not intrude on him;\nA dime, another ball, is worthless. Now\nHe senses first responsibility\nIn a world of possessions. People will take\nBalls, balls will be lost always, little boy.\nAnd no one buys a ball back. Money is external.\nHe is learning, well behind his desperate eyes,\nThe epistemology of loss, how to stand up\nKnowing what every man must one day know\nAnd most know many days, how to stand up.""",
        'excerpt': 'What is the boy now, who has lost his ball, what, what is he to do?',
        'cover_image_url': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80'
    },
    'if-poem': {
        'title': 'If—',
        'author': 'Rudyard Kipling',
        'type': 'poem',
        'body': """If you can keep your head when all about you\n    Are losing theirs and blaming it on you,\nIf you can trust yourself when all men doubt you,\n    But make allowance for their doubting too;\nIf you can wait and not be tired by waiting,\n    Or being lied about, don't deal in lies,\nOr being hated, don't give way to hating,\n    And yet don't look too good, nor talk too wise:\n\nIf you can dream — and not make dreams your master;\n    If you can think — and not make thoughts your aim;\nIf you can meet with Triumph and Disaster\n    And treat those two impostors just the same;\nIf you can bear to hear the truth you've spoken\n    Twisted by knaves to make a trap for fools,\nOr watch the things you gave your life to, broken,\n    And stoop and build 'em up with worn-out tools:\n\nIf you can make one heap of all your winnings\n    And risk it on one turn of pitch-and-toss,\nAnd lose, and start again at your beginnings\n    And never breathe a word about your loss;\nIf you can force your heart and nerve and sinew\n    To serve your turn long after they are gone,\nAnd so hold on when there is nothing in you\n    Except the Will which says to them: 'Hold on!'\n\nIf you can talk with crowds and keep your virtue,\n    Or walk with Kings — nor lose the common touch,\nIf neither foes nor loving friends can hurt you,\n    If all men count with you, but none too much;\nIf you can fill the unforgiving minute\n    With sixty seconds' worth of distance run,\nYours is the Earth and everything that's in it,\n    And — which is more — you'll be a Man, my son!""",
        'excerpt': 'If you can keep your head when all about you are losing theirs and blaming it on you...',
        'cover_image_url': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80'
    },
    'the-tyger': {
        'title': 'The Tyger',
        'author': 'William Blake',
        'type': 'poem',
        'body': """Tyger Tyger, burning bright,\nIn the forests of the night;\nWhat immortal hand or eye,\nCould frame thy fearful symmetry?\n\nIn what distant deeps or skies,\nBurnt the fire of thine eyes?\nOn what wings dare he aspire?\nWhat the hand, dare seize the fire?\n\nAnd what shoulder, & what art,\nCould twist the sinews of thy heart?\nAnd when thy heart began to beat,\nWhat dread hand? & what dread feet?\n\nWhat the hammer? what the chain,\nIn what furnace was thy brain?\nWhat the anvil? what dread grasp,\nDare its deadly terrors clasp!\n\nWhen the stars threw down their spears\nAnd water'd heaven with their tears:\nDid he smile his work to see?\nDid he who made the Lamb make thee?\n\nTyger Tyger burning bright,\nIn the forests of the night:\nWhat immortal hand or eye,\nDare frame thy fearful symmetry?""",
        'excerpt': 'Tyger Tyger, burning bright, in the forests of the night...',
        'cover_image_url': 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=800&q=80'
    },
    'daffodils': {
        'title': 'I Wandered Lonely as a Cloud',
        'author': 'William Wordsworth',
        'type': 'poem',
        'body': """I wandered lonely as a cloud\nThat floats on high o'er vales and hills,\nWhen all at once I saw a crowd,\nA host, of golden daffodils;\nBeside the lake, beneath the trees,\nFluttering and dancing in the breeze.\n\nContinuous as the stars that shine\nAnd twinkle on the milky way,\nThey stretched in never-ending line\nAlong the margin of a bay:\nTen thousand saw I at a glance,\nTossing their heads in sprightly dance.\n\nThe waves beside them danced; but they\nOut-did the sparkling waves in glee:\nA poet could not but be gay,\nIn such a jocund company:\nI gazed — and gazed — but little thought\nWhat wealth the show to me had brought:\n\nFor oft, when on my couch I lie\nIn vacant or in pensive mood,\nThey flash upon that inward eye\nWhich is the bliss of solitude;\nAnd then my heart with pleasure fills,\nAnd dances with the daffodils.""",
        'excerpt': 'I wandered lonely as a cloud that floats on high o\'er vales and hills...',
        'cover_image_url': 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?auto=format&fit=crop&w=800&q=80'
    },
    'ozymandias': {
        'title': 'Ozymandias',
        'author': 'Percy Bysshe Shelley',
        'type': 'poem',
        'body': """I met a traveller from an antique land,\nWho said — "Two vast and trunkless legs of stone\nStand in the desert. . . . Near them, on the sand,\nHalf sunk a shattered visage lies, whose frown,\nAnd wrinkled lip, and sneer of cold command,\nTell that its sculptor well those passions read\nWhich yet survive, stamped on these lifeless things,\nThe hand that mocked them, and the heart that fed;\nAnd on the pedestal, these words appear:\nMy name is Ozymandias, King of Kings;\nLook on my Works, ye Mighty, and despair!\nNothing beside remains. Round the decay\nOf that colossal Wreck, boundless and bare\nThe lone and level sands stretch far away.\"""",
        'excerpt': 'I met a traveller from an antique land who said: Two vast and trunkless legs of stone...',
        'cover_image_url': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80'
    },
    'looking-for-alaska': {
        'title': 'Looking for Alaska — "The Labyrinth"',
        'author': 'John Green',
        'type': 'story',
        'body': """"How will I ever get out of this labyrinth!" Alaska said, her voice bouncing off the cinder-block walls of her room.\n\nMiles looked at her. Her hair, dark and tangled, fell across her face. She wasn't asking him. She was asking the fluorescent light humming above, the stack of dog-eared books on her desk, the half-empty bottle.\n\n"The only way out of the labyrinth of suffering is to forgive," he whispered, though he wasn't sure he believed it yet.\n\nAlaska turned to him. "That's Simón Bolívar's last words. But he never said how. He just died in his labyrinth."\n\nThe night was heavy with the kind of silence that makes you aware of your own breathing. Somewhere across the campus, a door shut. Miles thought about all the doors that shut without anyone noticing — the small, daily closings that don't make a sound but change everything.\n\n"Maybe," he said finally, "the labyrinth isn't something you escape. Maybe it's something you learn to walk through."\n\nAlaska smiled. Not a happy smile. The kind that says: I want to believe you, but I've been lost for so long that the walls feel like home.""",
        'excerpt': '"How will I ever get out of this labyrinth!" she said, her voice echoing off the walls.',
        'cover_image_url': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80'
    },
    'fault-in-our-stars': {
        'title': 'The Fault in Our Stars — "Infinities"',
        'author': 'John Green',
        'type': 'story',
        'body': """"Some infinities are bigger than other infinities," Hazel said, sitting in the grass of the park, her oxygen tank beside her like a loyal, unwanted pet.\n\nAugustus looked at her — really looked, the way you look at a painting when you're trying to understand what the artist felt, not just what they drew.\n\n"Like between zero and one, there are infinite numbers," she continued. "But between zero and two, there's a bigger infinity. Both are infinite, but one is literally twice as big."\n\n"So what you're saying," Augustus said slowly, putting an unlit cigarette between his lips — the metaphor she'd never quite gotten used to — "is that our infinity might be small. But it's still ours."\n\nThe sun was doing that thing where it sits right on the edge of the buildings, making everything gold and long-shadowed. The kind of light that makes you feel like time itself is stretching, giving you just a few more minutes.\n\n"I'm saying," Hazel whispered, "that I'm grateful for our little infinity. I wouldn't trade it for the world."\n\nAnd in that park, in that golden hour, with the weight of everything unspoken between them — the hospital rooms, the midnight phone calls, the impossible hope — they sat, and they were infinite.""",
        'excerpt': 'Some infinities are bigger than other infinities. A writer we used to like taught us that.',
        'cover_image_url': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80'
    },
    'paper-towns': {
        'title': 'Paper Towns — "The Strings"',
        'author': 'John Green',
        'type': 'story',
        'body': """"The thing about Margo Roth Spiegelman," Quentin said, staring at the thumbtack map on his wall, "is that she was never who I thought she was."\n\nHe had spent his whole life watching her from across the cul-de-sac. She was the girl who orchestrated elaborate pranks. The girl who ran away and left clues like breadcrumbs for someone brave enough to follow.\n\nBut the clues weren't a treasure map. They were a mirror.\n\n"I always thought she was a miracle," he said. "But a miracle is something that isn't real. What I discovered is that she's a person. And persons are better than miracles."\n\nThe road stretched out ahead. The paper towns — those places that exist on maps but not in reality — fell behind them one by one.\n\n"What are the strings?" Lacey asked from the back seat.\n\n"It's something Margo wrote. She said: 'Maybe all the strings inside him broke.' Like people are held together by these invisible strings, and when enough of them snap, you come apart."\n\nBen was quiet. Radar was quiet. The highway hummed beneath them.\n\n"The thing is," Quentin said, "the strings don't break. They stretch. And sometimes, when you follow them far enough, they lead you right to the person you were supposed to find.""",
        'excerpt': 'Maybe she loved mysteries so much that she became one.',
        'cover_image_url': 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=800&q=80'
    }
}

async def seed():
    try:
        async with await psycopg.AsyncConnection.connect(DB_CONN, autocommit=True) as conn:
            async with conn.cursor() as cur:
                # 1. Get an existing admin user or create a "System" user
                await cur.execute("SELECT id FROM users WHERE is_admin = true LIMIT 1")
                admin = await cur.fetchone()
                if not admin:
                     # Create a default user if none exists
                     await cur.execute(
                         "INSERT INTO users (email, username, display_name, is_admin) VALUES (%s, %s, %s, %s) RETURNING id",
                         ("system@unsaid.page", "system", "The Unsaid Page", True)
                     )
                     admin_id = (await cur.fetchone())[0]
                else:
                    admin_id = admin[0]

                print(f"Using Admin ID: {admin_id}")

                for slug, data in MOCK_DATA.items():
                    # Calculate reading time
                    word_count = len(data['body'].split())
                    reading_time_sec = math.ceil((word_count / 200) * 60)
                    minutes = math.ceil(reading_time_sec / 60)
                    reading_time_label = f"{minutes} min read"

                    await cur.execute(
                        """INSERT INTO posts (author_id, title, slug, body_markdown, type, excerpt,
                                              cover_image_url, reading_time_sec, reading_time_label,
                                              status, visibility, published_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                           ON CONFLICT (slug) DO UPDATE SET
                                body_markdown = EXCLUDED.body_markdown,
                                excerpt = EXCLUDED.excerpt,
                                cover_image_url = EXCLUDED.cover_image_url
                        """,
                        (admin_id, data['title'], slug, data['body'], data['type'],
                         data['excerpt'], data['cover_image_url'], reading_time_sec, reading_time_label,
                         'published', 'public', datetime.datetime.now())
                    )
                    print(f"Seeded: {data['title']}")

        print("✅ Seeding complete.")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
