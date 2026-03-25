import api from '../api/apiClient';

// ── Local fallback data — famous poems & story excerpts ──
export const mockData = {

    // ═══════════════════════════════════════════════════════════
    //                        P O E M S
    // ═══════════════════════════════════════════════════════════

    // ── Robert Frost ──
    'road-not-taken': {
        id: 'road-not-taken',
        title: 'The Road Not Taken',
        date: '1916',
        author: 'Robert Frost',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['romantic', 'late-night'],
        tags: ['youth', 'love'],
        excerpt: 'Two roads diverged in a yellow wood, and sorry I could not travel both...',
        imgUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\nTo where it bent in the undergrowth;\n\nThen took the other, as just as fair,\nAnd having perhaps the better claim,\nBecause it was grassy and wanted wear;\nThough as for that the passing there\nHad worn them really about the same,\n\nAnd both that morning equally lay\nIn leaves no step had trodden black.\nOh, I kept the first for another day!\nYet knowing how way leads on to way,\nI doubted if I should ever come back.\n\nI shall be telling this with a sigh\nSomewhere ages and ages hence:\nTwo roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference.`
    },
    'stopping-by-woods': {
        id: 'stopping-by-woods',
        title: 'Stopping by Woods on a Snowy Evening',
        date: '1923',
        author: 'Robert Frost',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['healing', 'heartbreak'],
        tags: ['loss', 'time'],
        excerpt: 'Whose woods these are I think I know. His house is in the village though...',
        imgUrl: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Whose woods these are I think I know.\nHis house is in the village though;\nHe will not see me stopping here\nTo watch his woods fill up with snow.\n\nMy little horse must think it queer\nTo stop without a farmhouse near\nBetween the woods and frozen lake\nThe darkest evening of the year.\n\nHe gives his harness bells a shake\nTo ask if there is some mistake.\nThe only other sound's the sweep\nOf easy wind and downy flake.\n\nThe woods are lovely, dark and deep,\nBut I have promises to keep,\nAnd miles to go before I sleep,\nAnd miles to go before I sleep.`
    },
    'fire-and-ice': {
        id: 'fire-and-ice',
        title: 'Fire and Ice',
        date: '1920',
        author: 'Robert Frost',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['angry', 'dreamy'],
        tags: ['youth', 'love'],
        excerpt: 'Some say the world will end in fire, some say in ice...',
        imgUrl: 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Some say the world will end in fire,\nSome say in ice.\nFrom what I've tasted of desire\nI hold with those who favor fire.\nBut if it had to perish twice,\nI think I know enough of hate\nTo say that for destruction ice\nIs also great\nAnd would suffice.`
    },
    'nothing-gold-can-stay': {
        id: 'nothing-gold-can-stay',
        title: 'Nothing Gold Can Stay',
        date: '1923',
        author: 'Robert Frost',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['healing', 'late-night'],
        tags: ['hope', 'nature'],
        excerpt: "Nature's first green is gold, her hardest hue to hold...",
        imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Nature's first green is gold,\nHer hardest hue to hold.\nHer early leaf's a flower;\nBut only so an hour.\nThen leaf subsides to leaf.\nSo Eden sank to grief,\nSo dawn goes down to day.\nNothing gold can stay.`
    },

    // ── William Shakespeare ──
    'sonnet-18': {
        id: 'sonnet-18',
        title: 'Sonnet 18 — Shall I Compare Thee',
        date: '1609',
        author: 'William Shakespeare',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['angry', 'healing'],
        tags: ['nature', 'loss'],
        excerpt: "Shall I compare thee to a summer's day? Thou art more lovely and more temperate...",
        imgUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Shall I compare thee to a summer's day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date;\n\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimm'd;\nAnd every fair from fair sometime declines,\nBy chance or nature's changing course untrimm'd;\n\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou owest;\nNor shall death brag thou wander'st in his shade,\nWhen in eternal lines to time thou growest:\n\nSo long as men can breathe or eyes can see,\nSo long lives this, and this gives life to thee.`
    },

    // ── John Berryman ──
    'the-ball-poem': {
        id: 'the-ball-poem',
        title: 'The Ball Poem',
        date: '1948',
        author: 'John Berryman',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['nostalgic', 'angry'],
        tags: ['time', 'loss'],
        excerpt: 'What is the boy now, who has lost his ball, what, what is he to do?',
        imgUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `What is the boy now, who has lost his ball,\nWhat, what is he to do? I saw it go\nMerrily bouncing, down the street, and then\nMerrily over — there it is in the water!\nNo use to say 'O there are other balls':\nAn ultimate shaking grief fixes the boy\nAs he stands rigid, trembling, staring down\nAll his young days into the harbour where\nHis ball went. I would not intrude on him;\nA dime, another ball, is worthless. Now\nHe senses first responsibility\nIn a world of possessions. People will take\nBalls, balls will be lost always, little boy.\nAnd no one buys a ball back. Money is external.\nHe is learning, well behind his desperate eyes,\nThe epistemology of loss, how to stand up\nKnowing what every man must one day know\nAnd most know many days, how to stand up.`
    },

    // ── Rudyard Kipling ──
    'if-poem': {
        id: 'if-poem',
        title: 'If—',
        date: '1910',
        author: 'Rudyard Kipling',
        type: 'Poem',
        readingTime: '2 min read',
        moods: ['reflective', 'heartbreak'],
        tags: ['nature', 'love'],
        excerpt: 'If you can keep your head when all about you are losing theirs and blaming it on you...',
        imgUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `If you can keep your head when all about you\n    Are losing theirs and blaming it on you,\nIf you can trust yourself when all men doubt you,\n    But make allowance for their doubting too;\nIf you can wait and not be tired by waiting,\n    Or being lied about, don't deal in lies,\nOr being hated, don't give way to hating,\n    And yet don't look too good, nor talk too wise:\n\nIf you can dream — and not make dreams your master;\n    If you can think — and not make thoughts your aim;\nIf you can meet with Triumph and Disaster\n    And treat those two impostors just the same;\nIf you can bear to hear the truth you've spoken\n    Twisted by knaves to make a trap for fools,\nOr watch the things you gave your life to, broken,\n    And stoop and build 'em up with worn-out tools:\n\nIf you can make one heap of all your winnings\n    And risk it on one turn of pitch-and-toss,\nAnd lose, and start again at your beginnings\n    And never breathe a word about your loss;\nIf you can force your heart and nerve and sinew\n    To serve your turn long after they are gone,\nAnd so hold on when there is nothing in you\n    Except the Will which says to them: 'Hold on!'\n\nIf you can talk with crowds and keep your virtue,\n    Or walk with Kings — nor lose the common touch,\nIf neither foes nor loving friends can hurt you,\n    If all men count with you, but none too much;\nIf you can fill the unforgiving minute\n    With sixty seconds' worth of distance run,\nYours is the Earth and everything that's in it,\n    And — which is more — you'll be a Man, my son!`
    },

    // ── William Blake ──
    'the-tyger': {
        id: 'the-tyger',
        title: 'The Tyger',
        date: '1794',
        author: 'William Blake',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['quiet', 'hopeful'],
        tags: ['love', 'hope'],
        excerpt: 'Tyger Tyger, burning bright, in the forests of the night...',
        imgUrl: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Tyger Tyger, burning bright,\nIn the forests of the night;\nWhat immortal hand or eye,\nCould frame thy fearful symmetry?\n\nIn what distant deeps or skies,\nBurnt the fire of thine eyes?\nOn what wings dare he aspire?\nWhat the hand, dare seize the fire?\n\nAnd what shoulder, & what art,\nCould twist the sinews of thy heart?\nAnd when thy heart began to beat,\nWhat dread hand? & what dread feet?\n\nWhat the hammer? what the chain,\nIn what furnace was thy brain?\nWhat the anvil? what dread grasp,\nDare its deadly terrors clasp!\n\nWhen the stars threw down their spears\nAnd water'd heaven with their tears:\nDid he smile his work to see?\nDid he who made the Lamb make thee?\n\nTyger Tyger burning bright,\nIn the forests of the night:\nWhat immortal hand or eye,\nDare frame thy fearful symmetry?`
    },

    // ── William Wordsworth ──
    'daffodils': {
        id: 'daffodils',
        title: 'I Wandered Lonely as a Cloud',
        date: '1807',
        author: 'William Wordsworth',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['joyful', 'heartbreak'],
        tags: ['love', 'nature'],
        excerpt: 'I wandered lonely as a cloud that floats on high o\'er vales and hills...',
        imgUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `I wandered lonely as a cloud\nThat floats on high o'er vales and hills,\nWhen all at once I saw a crowd,\nA host, of golden daffodils;\nBeside the lake, beneath the trees,\nFluttering and dancing in the breeze.\n\nContinuous as the stars that shine\nAnd twinkle on the milky way,\nThey stretched in never-ending line\nAlong the margin of a bay:\nTen thousand saw I at a glance,\nTossing their heads in sprightly dance.\n\nThe waves beside them danced; but they\nOut-did the sparkling waves in glee:\nA poet could not but be gay,\nIn such a jocund company:\nI gazed — and gazed — but little thought\nWhat wealth the show to me had brought:\n\nFor oft, when on my couch I lie\nIn vacant or in pensive mood,\nThey flash upon that inward eye\nWhich is the bliss of solitude;\nAnd then my heart with pleasure fills,\nAnd dances with the daffodils.`
    },

    // ── Percy Bysshe Shelley ──
    'ozymandias': {
        id: 'ozymandias',
        title: 'Ozymandias',
        date: '1818',
        author: 'Percy Bysshe Shelley',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['nostalgic', 'melancholic'],
        tags: ['nature', 'loss'],
        excerpt: 'I met a traveller from an antique land who said: Two vast and trunkless legs of stone...',
        imgUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `I met a traveller from an antique land,\nWho said — "Two vast and trunkless legs of stone\nStand in the desert. . . . Near them, on the sand,\nHalf sunk a shattered visage lies, whose frown,\nAnd wrinkled lip, and sneer of cold command,\nTell that its sculptor well those passions read\nWhich yet survive, stamped on these lifeless things,\nThe hand that mocked them, and the heart that fed;\nAnd on the pedestal, these words appear:\nMy name is Ozymandias, King of Kings;\nLook on my Works, ye Mighty, and despair!\nNothing beside remains. Round the decay\nOf that colossal Wreck, boundless and bare\nThe lone and level sands stretch far away."`
    },

    // ── Edgar Allan Poe ──
    'annabel-lee': {
        id: 'annabel-lee',
        title: 'Annabel Lee',
        date: '1849',
        author: 'Edgar Allan Poe',
        type: 'Poem',
        readingTime: '2 min read',
        moods: ['quiet', 'heartbreak'],
        tags: ['time', 'love'],
        excerpt: 'It was many and many a year ago, in a kingdom by the sea...',
        imgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `It was many and many a year ago,\n   In a kingdom by the sea,\nThat a maiden there lived whom you may know\n   By the name of Annabel Lee;\nAnd this maiden she lived with no other thought\n   Than to love and be loved by me.\n\nI was a child and she was a child,\n   In this kingdom by the sea,\nBut we loved with a love that was more than love —\n   I and my Annabel Lee —\nWith a love that the wingèd seraphs of Heaven\n   Coveted her and me.\n\nAnd this was the reason that, long ago,\n   In this kingdom by the sea,\nA wind blew out of a cloud, chilling\n   My beautiful Annabel Lee;\nSo that her highborn kinsmen came\n   And bore her away from me,\nTo shut her up in a sepulchre\n   In this kingdom by the sea.\n\nBut our love it was stronger by far than the love\n   Of those who were older than we —\n   Of many far wiser than we —\nAnd neither the angels in Heaven above\n   Nor the demons down under the sea\nCan ever dissever my soul from the soul\n   Of the beautiful Annabel Lee.`
    },

    // ── Dylan Thomas ──
    'do-not-go-gentle': {
        id: 'do-not-go-gentle',
        title: 'Do Not Go Gentle into That Good Night',
        date: '1951',
        author: 'Dylan Thomas',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['healing', 'quiet'],
        tags: ['youth', 'time'],
        excerpt: 'Do not go gentle into that good night. Rage, rage against the dying of the light.',
        imgUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Do not go gentle into that good night,\nOld age should burn and rave at close of day;\nRage, rage against the dying of the light.\n\nThough wise men at their end know dark is right,\nBecause their words had forked no lightning they\nDo not go gentle into that good night.\n\nGood men, the last wave by, crying how bright\nTheir frail deeds might have danced in a green bay,\nRage, rage against the dying of the light.\n\nWild men who caught and sang the sun in flight,\nAnd learn, too late, they grieved it on its way,\nDo not go gentle into that good night.\n\nGrave men, near death, who see with blinding sight\nBlind eyes could blaze like meteors and be gay,\nRage, rage against the dying of the light.\n\nAnd you, my father, there on the sad height,\nCurse, bless, me now with your fierce tears, I pray.\nDo not go gentle into that good night.\nRage, rage against the dying of the light.`
    },


    // ═══════════════════════════════════════════════════════════
    //                      S T O R I E S
    // ═══════════════════════════════════════════════════════════

    // ── John Green ──
    'looking-for-alaska': {
        id: 'looking-for-alaska',
        title: 'Looking for Alaska — "The Labyrinth"',
        date: '2005',
        author: 'John Green',
        type: 'Story',
        readingTime: '2 min read',
        moods: ['hopeful', 'quiet'],
        tags: ['time', 'hope'],
        excerpt: '"How will I ever get out of this labyrinth!" she said, her voice echoing off the walls.',
        imgUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `"How will I ever get out of this labyrinth!" Alaska said, her voice bouncing off the cinder-block walls of her room.\n\nMiles looked at her. Her hair, dark and tangled, fell across her face. She wasn't asking him. She was asking the fluorescent light humming above, the stack of dog-eared books on her desk, the half-empty bottle.\n\n"The only way out of the labyrinth of suffering is to forgive," he whispered, though he wasn't sure he believed it yet.\n\nAlaska turned to him. "That's Simón Bolívar's last words. But he never said how. He just died in his labyrinth."\n\nThe night was heavy with the kind of silence that makes you aware of your own breathing. Somewhere across the campus, a door shut. Miles thought about all the doors that shut without anyone noticing — the small, daily closings that don't make a sound but change everything.\n\n"Maybe," he said finally, "the labyrinth isn't something you escape. Maybe it's something you learn to walk through."\n\nAlaska smiled. Not a happy smile. The kind that says: I want to believe you, but I've been lost for so long that the walls feel like home.`
    },
    'fault-in-our-stars': {
        id: 'fault-in-our-stars',
        title: 'The Fault in Our Stars — "Infinities"',
        date: '2012',
        author: 'John Green',
        type: 'Story',
        readingTime: '2 min read',
        moods: ['late-night', 'angry'],
        tags: ['loss', 'youth'],
        excerpt: 'Some infinities are bigger than other infinities. A writer we used to like taught us that.',
        imgUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `"Some infinities are bigger than other infinities," Hazel said, sitting in the grass of the park, her oxygen tank beside her like a loyal, unwanted pet.\n\nAugustus looked at her — really looked, the way you look at a painting when you're trying to understand what the artist felt, not just what they drew.\n\n"Like between zero and one, there are infinite numbers," she continued. "But between zero and two, there's a bigger infinity. Both are infinite, but one is literally twice as big."\n\n"So what you're saying," Augustus said slowly, putting an unlit cigarette between his lips — the metaphor she'd never quite gotten used to — "is that our infinity might be small. But it's still ours."\n\nThe sun was doing that thing where it sits right on the edge of the buildings, making everything gold and long-shadowed. The kind of light that makes you feel like time itself is stretching, giving you just a few more minutes.\n\n"I'm saying," Hazel whispered, "that I'm grateful for our little infinity. I wouldn't trade it for the world."\n\nAnd in that park, in that golden hour, with the weight of everything unspoken between them — the hospital rooms, the midnight phone calls, the impossible hope — they sat, and they were infinite.`
    },
    'paper-towns': {
        id: 'paper-towns',
        title: 'Paper Towns — "The Strings"',
        date: '2008',
        author: 'John Green',
        type: 'Story',
        readingTime: '2 min read',
        moods: ['dreamy', 'reflective'],
        tags: ['hope', 'time'],
        excerpt: 'Maybe she loved mysteries so much that she became one.',
        imgUrl: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `"The thing about Margo Roth Spiegelman," Quentin said, staring at the thumbtack map on his wall, "is that she was never who I thought she was."\n\nHe had spent his whole life watching her from across the cul-de-sac. She was the girl who orchestrated elaborate pranks. The girl who ran away and left clues like breadcrumbs for someone brave enough to follow.\n\nBut the clues weren't a treasure map. They were a mirror.\n\n"I always thought she was a miracle," he said. "But a miracle is something that isn't real. What I discovered is that she's a person. And persons are better than miracles."\n\nThe road stretched out ahead. The paper towns — those places that exist on maps but not in reality — fell behind them one by one.\n\n"What are the strings?" Lacey asked from the back seat.\n\n"It's something Margo wrote. She said: 'Maybe all the strings inside him broke.' Like people are held together by these invisible strings, and when enough of them snap, you come apart."\n\nBen was quiet. Radar was quiet. The highway hummed beneath them.\n\n"The thing is," Quentin said, "the strings don't break. They stretch. And sometimes, when you follow them far enough, they lead you right to the person you were supposed to find."`
    },

    // ── Roald Dahl ──
    'charlie-chocolate': {
        id: 'charlie-chocolate',
        title: 'Charlie and the Chocolate Factory — "The Golden Ticket"',
        date: '1964',
        author: 'Roald Dahl',
        type: 'Story',
        readingTime: '3 min read',
        moods: ['romantic', 'dreamy'],
        tags: ['time', 'loss'],
        excerpt: 'Charlie held the golden ticket with trembling fingers. The whole street had gone quiet.',
        imgUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `The coin was not his. It was lying in the gutter, half-hidden under a crust of old snow, and Charlie Bucket saw it glinting in the pale February sunlight.\n\nHe picked it up and turned it over. Fifty pence. To most children, this was the price of a comic book or a bag of sweets. To Charlie, who ate cabbage soup for dinner and wore shoes with holes that let the winter in, it was a fortune.\n\nHe should have taken it home. He knew that. His family needed every penny. But his feet carried him to the newsagent on the corner, and his hand placed the coin on the counter, and his voice said, "A Wonka's Whipple-Scrumptious Fudgemallow Delight, please."\n\nHe peeled the wrapper slowly. Not because he was savoring it — though he was — but because he was afraid. Afraid of what might be underneath. Afraid of what might not be.\n\nAnd then he saw it.\n\nGold. Not chocolate-wrapper gold. Real gold. The kind that has weight and light and promise.\n\nTHE GOLDEN TICKET.\n\nThe newsagent dropped his jaw. A woman in the queue gasped. A boy about Charlie's age pressed his face to the shop window.\n\nCharlie held the ticket with trembling fingers and read the words printed in elegant black ink:\n\n"Greetings to you, the lucky finder of this Golden Ticket, from Mr. Willy Wonka!"\n\nThe whole street had gone quiet. And for the first time in a very long time, Charlie Bucket smiled.`
    },
    'matilda-books': {
        id: 'matilda-books',
        title: 'Matilda — "The Reader of Books"',
        date: '1988',
        author: 'Roald Dahl',
        type: 'Story',
        readingTime: '3 min read',
        moods: ['heartbreak', 'dreamy'],
        tags: ['youth', 'nature'],
        excerpt: 'By the time she was three, Matilda had taught herself to read by studying newspapers and magazines.',
        imgUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `By the time she was three, Matilda had taught herself to read by studying newspapers and magazines that lay around the house. At the age of four, she could read fast and well and she naturally began hankering after books.\n\nThe only book in the whole of her household was something called Easy Cooking belonging to her mother, and when she had read this from cover to cover and had learnt all the recipes by heart, she decided that the time had come to ask for a proper book.\n\n"Daddy," she said, "do you think you could buy me a book?"\n\n"A book?" he said. "What d'you want a flaming book for?"\n\n"To read, Daddy."\n\n"What's wrong with the telly, for heaven's sake? We've got a lovely telly with a twelve-inch screen and now you come asking for a book! You're getting spoiled, my girl!"\n\nNearly every weekday afternoon, Matilda walked to the public library. The walk took only ten minutes. When she arrived, she would sit herself down in the children's corner and read for hours. She finished all the children's books in a week.\n\nThen she moved on to the adult section. The librarian, Mrs. Phelps, watched this tiny five-year-old girl sitting for hours reading enormous books, and she was astonished.\n\n"What are you reading?" Mrs. Phelps asked one day.\n\nMatilda held up the book. It was Great Expectations by Charles Dickens.\n\nMrs. Phelps nearly fell off her chair. "Don't you find it difficult?"\n\n"It's wonderful," Matilda said. "I love Mr. Dickens. He makes me laugh."\n\nAnd so it was that Matilda's strong young mind continued to grow, nurtured by the voices of all those authors who had sent their books out into the world like ships on the sea. These books gave Matilda a hopeful and comforting message: You are not alone.`
    },

    // ── Frances Hodgson Burnett ──
    'secret-garden': {
        id: 'secret-garden',
        title: 'The Secret Garden — "Behind the Wall"',
        date: '1911',
        author: 'Frances Hodgson Burnett',
        type: 'Story',
        readingTime: '3 min read',
        moods: ['romantic', 'reflective'],
        tags: ['nature', 'loss'],
        excerpt: 'If she could find the hidden door, she might find a world that had been sleeping for ten years.',
        imgUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4ce11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Mary stood before the wall, her fingers tracing the ivy that clung to the old brick like a secret trying not to be told.

The robin watched her from the branch of an ancient apple tree. It tilted its head as if to say: closer, closer.

She had heard the gardener, Ben Weatherstaff, say that there was a garden here once. "Locked up ten years ago," he'd muttered, his voice like gravel. "And the key buried with the memories."

But Mary was the kind of child who did not leave mysteries unsolved. She had spent her whole life in India being ignored, and in that vast loneliness she had learned something valuable: how to be patient.

So she waited. She watched. She followed the robin.

And one grey Yorkshire morning, when the wind blew the ivy aside like a curtain, she saw it — a door. Small, green, almost swallowed by time. A keyhole, rusted but real.

Her heart hammered. She pushed.

The door opened onto a world that had been sleeping. Roses, wild and tangled, climbed over arches that had forgotten their shape. The grass was long. The paths had disappeared under moss. The fountain was silent.

But it was alive. Beneath the neglect, beneath the years of locked doors and forgotten promises, things were growing.

Mary stepped inside, and for the first time in her life, she felt like she belonged somewhere. Not because someone had made a place for her — but because she had found one herself.`
    },

    // ── Emily Brontë ──
    'wuthering-heights': {
        id: 'wuthering-heights',
        title: 'Wuthering Heights — "The Moors"',
        date: '1847',
        author: 'Emily Brontë',
        type: 'Story',
        readingTime: '2 min read',
        moods: ['heartbreak', 'dreamy'],
        tags: ['love', 'hope'],
        excerpt: 'Whatever our souls are made of, his and mine are the same.',
        imgUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `The moors stretched out before them like an ocean of heather and wind. Catherine stood at the edge, her hair undone, her dress stained with earth, and she was laughing.\n\nHeathcliff watched her from below, climbing the last stones of the crag. He was always behind her, always looking up, and she was always ahead, always looking out.\n\n"Whatever our souls are made of," she said, turning to him, the wind stealing half her words, "his and mine are the same."\n\nShe wasn't talking about Edgar Linton, the man she would marry. She was talking about this — the wild, aching thing between them that had no name and no manners and no place in the drawing rooms of polite society.\n\nThe sky above the moors darkened. A storm was coming — as storms always were in this country. Heathcliff reached the top and stood beside her. They didn't touch. They didn't need to.\n\nSome loves are too large for the world they're born into. They crack things open — hearts, families, entire lifetimes — and leave behind a silence that echoes for generations.\n\nThe storm broke. And they stood in it together.`
    },

    // ── Maya Angelou ──
    'still-i-rise': {
        id: 'still-i-rise',
        title: 'Still I Rise',
        date: '1978',
        author: 'Maya Angelou',
        type: 'Poem',
        readingTime: '2 min read',
        moods: ['hopeful', 'angry'],
        tags: ['empowerment', 'life'],
        excerpt: 'You may write me down in history with your bitter, twisted lies...',
        imgUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `You may write me down in history
With your bitter, twisted lies,
You may trod me in the very dirt
But still, like dust, I'll rise.

Does my sassiness upset you?
Why are you beset with gloom?
’Cause I walk like I've got oil wells
Pumping in my living room.

Just like moons and like suns,
With the certainty of tides,
Just like hopes springing high,
Still I'll rise.

Did you want to see me broken?
Bowed head and lowered eyes?
Shoulders falling down like teardrops,
Weakened by my soulful cries?

Does my haughtiness offend you?
Don't you take it awful hard
’Cause I laugh like I've got gold mines
Diggin’ in my own backyard.

You may shoot me with your words,
You may cut me with your eyes,
You may kill me with your hatefulness,
But still, like air, I’ll rise.`
    },

    // ── Edgar Allan Poe ──
    'tell-tale-heart': {
        id: 'tell-tale-heart',
        title: 'The Tell-Tale Heart',
        date: '1843',
        author: 'Edgar Allan Poe',
        type: 'Story',
        readingTime: '5 min read',
        moods: ['melancholic', 'angry'],
        tags: ['horror', 'mystery'],
        excerpt: 'TRUE! — nervous — very, very dreadfully nervous I had been and am; but why will you say that I am mad?',
        imgUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `TRUE! — nervous — very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses — not destroyed — not dulled them. Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How, then, am I mad? Hearken! and observe how healthily — how calmly I can tell you the whole story.

It is impossible to say how first the idea entered my brain; but once conceived, it haunted me day and night. Object there was none. Passion there was none. I loved the old man. He had never wronged me. He had never given me insult. For his gold I had no desire. I think it was his eye! yes, it was this! He had the eye of a vulture —a pale blue eye, with a film over it. Whenever it fell upon me, my blood ran cold; and so by degrees — very gradually — I made up my mind to take the life of the old man, and thus rid myself of the eye forever.

Now this is the point. You fancy me mad. Madmen know nothing. But you should have seen me. You should have seen how wisely I proceeded — with what caution — with what foresight — with what dissimulation I went to work!`
    },

    // ── Gurnoor Singh Jais (New Additions) ──
    'echoes-of-silence': {
        id: 'echoes-of-silence',
        title: 'Echoes of Silence',
        date: '2023',
        author: 'E. Rivers',
        type: 'Poem',
        readingTime: '2 min read',
        moods: ['melancholy', 'reflective'],
        tags: ['solitude', 'memory'],
        excerpt: 'In the quiet room where shadows stretch...',
        imgUrl: 'https://images.unsplash.com/photo-1518599904199-0ca897819ddb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `In the quiet room where shadows stretch,
And dust motes dance in faded light,
I hear the echoes of the words you left,
Resounding softly through the night.

The books we read stand silent now,
Their spines untouched, their pages still.
The clock ticks on, a steady metronome,
Measuring the void I cannot fill.

I trace the outline of your absent form,
Against the space where you used to be.
And in this profound and heavy hush,
Your silence speaks volumes to me.`
    },

    'the-clockmaker': {
        id: 'the-clockmaker',
        title: 'The Clockmaker\'s Secret',
        date: '2024',
        author: 'Arthur Pendelton',
        type: 'Story',
        readingTime: '5 min read',
        moods: ['mysterious', 'curious'],
        tags: ['time', 'craftsmanship'],
        excerpt: 'Elias Thorne never simply built a clock; he trapped a piece of time itself...',
        imgUrl: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Elias Thorne never simply built a clock; he trapped a piece of time itself within the brass and gears. His shop, tucked away in a cobblestone alley that most maps forgot, smelled of oil, aged wood, and the metallic tang of ticking seconds.

People came to Elias not just for repairs, but to buy moments. They didn't know this, of course. They just knew that the grandfather clock with the moon-phase dial seemed to make their evenings stretch just a little longer, or that the silver pocket watch made the grueling workday feel perceptibly swifter.

His secret lay in the mainsprings. Elias didn't forge them in a normal fire. He forged them in the heat of memories. A spring cooled in a jar of tears held sorrowful, slow time. A spring quenched in the laughter of children yielded fast, joyous hours.

But the real mastery—the forbidden craft—was tempering a spring in nothing at all. In the absolute void of a forgotten thought. These were the clocks that simply stopped time altogether, just for a breath, just long enough to let a heart heal.`
    },

    'autumn-leaves': {
        id: 'autumn-leaves',
        title: 'Autumn Leaves',
        date: '2022',
        author: 'Clara Vance',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['peaceful', 'nostalgic'],
        tags: ['nature', 'seasons'],
        excerpt: 'A symphony of gold and red, descending to their earthy bed...',
        imgUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `A symphony of gold and red,
Descending to their earthy bed.
The trees exhale a trembling sigh,
As summer bids a slow goodbye.

Crisp air bites at the rosy cheek,
While nature plays hide and seek.
A tapestry upon the ground,
Where quiet, fleeting peace is found.`
    },

    'the-lighthouse': {
        id: 'the-lighthouse',
        title: 'The Lighthouse Keeper',
        date: '2023',
        author: 'Samuel Black',
        type: 'Story',
        readingTime: '4 min read',
        moods: ['lonely', 'hopeful'],
        tags: ['ocean', 'duty'],
        excerpt: 'For thirty years, Silas had been the only resident of the craggy rock known as Widow\'s Peak...',
        imgUrl: 'https://images.unsplash.com/photo-1549558549-415fe4c37b60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `For thirty years, Silas had been the only resident of the craggy rock known as Widow's Peak. The lighthouse was his home, his master, and his sole companion. He knew its groans in the winter gales, its brass fittings that needed constant polishing to stave off the sea salt, and the rhythm of its rotating beam better than he knew the beating of his own heart.

He rarely received letters. The supply boat came once a month, dropping off canned goods and taking away his empty solitude, only to replace it with fresh silence. But tonight was different.

A tempest was raging, the worst he'd seen since '98. The waves were towering, crashing against the base of the tower with earth-shattering force. Then, he saw it. A flare, burning a defiant crimson against the pitch-black sky.

Silas didn't hesitate. He grabbed his heavy coat, the thick ropes, and stepped out into the howling wind. It wasn't about the job anymore; it was about the unspoken promise every keeper makes to the sea. He would bring them home.`
    },

    'city-lights': {
        id: 'city-lights',
        title: 'Neon Lullaby',
        date: '2024',
        author: 'J.D. Sterling',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['energetic', 'urban'],
        tags: ['city', 'night'],
        excerpt: 'Concrete canyons pulse with electric veins...',
        imgUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `Concrete canyons pulse with electric veins,
Washing the sidewalks in synthetic rains.
Neon signs hum a jagged tune,
Beneath the gaze of a smog-smudged moon.

A thousand faces pass in blur,
A frantic, endless, vivid stir.
Yet in this crowd, I walk apart,
Guided by the rhythm of a restless heart.`
    },

    'forgotten-library': {
        id: 'forgotten-library',
        title: 'The Dust Atlas',
        date: '2023',
        author: 'Elena Rostova',
        type: 'Story',
        readingTime: '6 min read',
        moods: ['mysterious', 'wonder'],
        tags: ['books', 'magic'],
        excerpt: 'The library didn\'t exist on any modern map. You had to find it by getting lost...',
        imgUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `The library didn't exist on any modern map. You had to find it by getting lost, truly and utterly lost, in the winding backstreets of the old quarter. When the fog rolled in thick from the river, and the cobblestones slicked with damp, you might just stumble upon the brass-handled door.

Inside, it smelled of dry paper and forgotten conversations. Millions of books, categorized not by author or subject, but by the emotion they evoked. There was a section for 'Shattered Expectations,' another for 'Quiet Tuesday Afternoons,' and one marked simply 'Longing.'

The librarian, a woman who seemed woven from gray wool and cobwebs, never spoke. She merely offered a small, silver compass to each visitor. It didn't point North; it pointed toward the book your soul needed most at that exact moment.

When I took the compass, the needle spun wildly before settling on a dark, narrow aisle. It led me to a book bound in deep blue velvet. The title was blank. When I opened it, the pages were unwritten, waiting for the story I had been too afraid to live.`
    },

    'morning-mist': {
        id: 'morning-mist',
        title: 'Dawn\'s Veil',
        date: '2022',
        author: 'Liam O\'Connor',
        type: 'Poem',
        readingTime: '1 min read',
        moods: ['peaceful', 'ethereal'],
        tags: ['morning', 'nature'],
        excerpt: 'A silver blanket hugs the sleeping land...',
        imgUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `A silver blanket hugs the sleeping land,
Fashioned by a cool and unseen hand.
The world is hushed, the edges blurred and soft,
As gentle breezes carry dreams aloft.

The sun awakes, a soft and timid glow,
Melting the mist, revealing life below.
A brand new day, untarnished and unseen,
Washed in the dew, peaceful and serene.`
    },

    'the-painter': {
        id: 'the-painter',
        title: 'Colors of Memory',
        date: '2024',
        author: 'Isabella Rossi',
        type: 'Story',
        readingTime: '4 min read',
        moods: ['nostalgic', 'creative'],
        tags: ['art', 'memory'],
        excerpt: 'She didn\'t paint what she saw; she painted what she remembered feeling...',
        imgUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        body: `She didn't paint what she saw; she painted what she remembered feeling. To anyone else, the canvas was a chaotic swirl of cerulean, burnt sienna, and splashes of violent gold. But to her, it was the summer of 1999—the salt in the air, the heat of the sand, and the sudden, sharp grief of a goodbye she hadn't anticipated.

Her studio was a mess of dried palettes and empty coffee cups. She worked feverishly, trying to capture the exact hue of nostalgia before it faded. The problem with memory was that it degraded over time, losing saturation, becoming sepia-toned. Paint was her way of fighting back.

One evening, an old man walked into her gallery. He stared at a smaller, quieter piece—a study in muted greys and soft violet. He stood there for an hour, tears welling in his eyes. He didn't ask her what it meant. He just whispered, 'I thought I was the only one who remembered that rainstorm.'

And in that moment, she realized her brush wasn't just capturing her own memories; it was speaking to the unspoken pages of everyone else's.`
    }
};

// ── Default cover images for backend posts missing one ──
const defaultCovers = {
    poem: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    story: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
};

// ── Normalize backend post → frontend shape ──
const normalize = (post) => ({
    id: post.slug || post.id,
    title: post.title,
    date: post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    author: post.author_display || post.author_name || 'Anonymous',
    type: post.type ? post.type.charAt(0).toUpperCase() + post.type.slice(1) : '',
    readingTime: post.reading_time_label || '',
    excerpt: post.excerpt || '',
    imgUrl: post.cover_image_url || defaultCovers[post.type] || defaultCovers.poem,
    body: post.body_markdown || post.body || '',
    snapCount: post.snap_count || 0,
    moods: post.moods || [],
    tags: post.tags || [],
    dbId: post.id, // UUID for API calls (snaps etc)
});

// ── Fetch posts list — real API first, mock fallback ──
export const fetchPostsList = async (type = 'All', filters = {}) => {
    const matchesFilters = (post) => {
        const query = (filters.query || '').trim().toLowerCase();
        const mood = (filters.mood || '').trim().toLowerCase();
        const tag = (filters.tag || '').trim().toLowerCase();
        const qOk = !query || [post.title, post.excerpt, post.body].some((v) => (v || '').toLowerCase().includes(query));
        const moodOk = !mood || (post.moods || []).map((m) => m.toLowerCase()).includes(mood);
        const tagOk = !tag || (post.tags || []).map((t) => t.toLowerCase()).includes(tag);
        return qOk && moodOk && tagOk;
    };
    try {
        const typeMap = { Story: 'story', Poem: 'poem', Reflection: 'reflection' };
        const params = {
            ...(typeMap[type] ? { type: typeMap[type] } : {}),
            ...(filters.query ? { q: filters.query } : {}),
            ...(filters.mood ? { mood: filters.mood } : {}),
            ...(filters.tag ? { tag: filters.tag } : {}),
        };
        const { data } = await api.get('/posts', { params });

        const dbPosts = data.map(normalize);

        // Merge with mock data so the site never looks empty
        const mockPosts = Object.values(mockData);
        const dbSlugs = new Set(dbPosts.map(p => p.id));
        const fallbackPosts = mockPosts.filter((p) => !dbSlugs.has(p.id)).filter(matchesFilters);

        let allPosts = [...dbPosts, ...fallbackPosts];
        if (type !== 'All') {
            allPosts = allPosts.filter(p => p.type === type);
        }
        return allPosts;
    } catch {
        // Backend unreachable — use mock data
        const posts = Object.values(mockData).filter(matchesFilters);
        if (type !== 'All') return posts.filter(p => p.type === type);
        return posts;
    }
};

// ── Fetch single post — real API first, mock fallback ──
export const fetchPostById = async (id) => {
    try {
        const { data } = await api.get(`/posts/${id}`);
        return normalize(data);
    } catch {
        if (mockData[id]) return mockData[id];
        throw new Error('Post not found');
    }
};

// ── Submit post — real API (auth required) ──
export const submitPost = async (postData) => {
    const { data } = await api.post('/posts', {
        title: postData.title,
        body_markdown: postData.content,
        type: postData.type || 'poem',
        excerpt: postData.content.substring(0, 150) + '...',
        moods: postData.moods || [],
        tags: postData.tags || [],
        is_anonymous: postData.anonymous || false,
    });
    return data;
};
